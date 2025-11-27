import tweepy
import os
import time
import hashlib
import json
import schedule
import threading
from datetime import datetime, timedelta
from collections import deque
from typing import List, Dict
from dotenv import load_dotenv

# AI/ML Dependencies
try:
    from transformers import pipeline
    SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    sentiment_pipeline = pipeline("sentiment-analysis", model=SENTIMENT_MODEL)
    SENTIMENT_AVAILABLE = True
    
    NER_MODEL = "Davlan/bert-base-multilingual-cased-ner-hrl"
    ner_pipeline = pipeline("ner", model=NER_MODEL, aggregation_strategy="simple")
    NER_AVAILABLE = True
except Exception:
    sentiment_pipeline = None
    SENTIMENT_AVAILABLE = False
    ner_pipeline = None
    NER_AVAILABLE = False

# Supabase
try:
    from supabase import create_client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

load_dotenv()

# ============================================================================

class Config:
    TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    MAX_RESULTS = 10
    DELAY_BETWEEN_SEARCHES = (8, 15)
    FREE_TIER_LIMIT = 150
    RATE_WINDOW_MINUTES = 15

    KENYAN_LOCATIONS = [
        'nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika', 
        'kakamega', 'machakos', 'kitui', 'meru', 'nyeri', 'kajiado', 'narok'
    ]

    KEYWORDS = [
        'kill you', 'kukuua', 'nitakuua', 'femicide', 'death threats',
        'rape threats', 'sexual assault', 'unyanyasaji wa kijinsia',
        'domestic violence', 'gbv', 'assault', 'kupigwa',
        'stalking', 'blackmail', 'human trafficking'
    ]

# ============================================================================

class DatabaseManager:
    def __init__(self):
        self.supabase = None
        self.local_backup = deque(maxlen=1000)
        self._connect()

    def _connect(self):
        if SUPABASE_AVAILABLE and Config.SUPABASE_URL and Config.SUPABASE_KEY:
            try:
                self.supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
            except Exception:
                self.supabase = None

    def save_threat(self, record: Dict):
        if self.supabase:
            try:
                self.supabase.table("twitter_threats").upsert(record, on_conflict="tweet_hash").execute()
            except Exception:
                pass
        self.local_backup.append({**record, "saved_at": datetime.now().isoformat()})

    def export_backup(self, filename="safeguard_backup.json"):
        if self.local_backup:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(list(self.local_backup), f, indent=2, ensure_ascii=False)

# ============================================================================

class ThreatAnalyzer:
    @staticmethod
    def analyze_threat(text: str) -> Dict:
        lower = text.lower()
        critical = ['kill', 'kukuua', 'nitakuua', 'murder', 'mauaji', 'kuuawa', 'attack', 'shambulio', 'stab', 'choma', 'shoot', 'piga risasi']
        high = ['rape', 'assault', 'battery', 'kubaka', 'kutesa', 'femicide', 'death threat', 'tisho la kifo', 'violence', 'vurugu']
        medium = ['beat', 'hurt', 'napiga', 'nitakupiga', 'threaten', 'harass', 'molest', 'stalk', 'blackmail', 'trafficking']

        score, category = 0, "neutral"
        if any(w in lower for w in critical):
            score, category = 85, "critical_threat"
        elif any(w in lower for w in high):
            score, category = 75, "high_threat"
        elif any(w in lower for w in medium):
            score, category = 60, "medium_threat"

        if any(loc in lower for loc in Config.KENYAN_LOCATIONS):
            score = min(95, score + 10)
        return {"threat_score": score, "threat_category": category}

    @staticmethod
    def analyze_sentiment(text: str) -> Dict:
        if not SENTIMENT_AVAILABLE:
            return {"sentiment": "N/A", "sentiment_score": 0.0}
        try:
            result = sentiment_pipeline(text[:512])[0]
            label = result.get("label", "N/A").capitalize()
            score = round(float(result.get("score", 0.0)), 3)
            return {"sentiment": label, "sentiment_score": score}
        except Exception:
            return {"sentiment": "Error", "sentiment_score": 0.0}

    @staticmethod
    def analyze_entities(text: str) -> str:
        if not NER_AVAILABLE:
            return ""
        try:
            ents = ner_pipeline(text[:1400])
            return " | ".join(set([f"{e['entity_group']}: {e['word']}" for e in ents if e['score'] > 0.8]))
        except Exception:
            return ""

# ============================================================================

class RateLimitTracker:
    def __init__(self):
        self.requests = deque(maxlen=Config.FREE_TIER_LIMIT)

    def add_request(self):
        self.requests.append(datetime.now())

    def should_wait(self) -> float:
        cutoff = datetime.now() - timedelta(minutes=Config.RATE_WINDOW_MINUTES)
        recent = [r for r in self.requests if r > cutoff]
        if len(recent) >= Config.FREE_TIER_LIMIT - 5:
            oldest = min(self.requests)
            wait_until = oldest + timedelta(minutes=Config.RATE_WINDOW_MINUTES)
            return max(0, (wait_until - datetime.now()).total_seconds()) + 10
        return 0

# ============================================================================

class TwitterClient:
    def __init__(self):
        if not Config.TWITTER_BEARER_TOKEN:
            raise RuntimeError("Missing TWITTER_BEARER_TOKEN")
        self.client = tweepy.Client(bearer_token=Config.TWITTER_BEARER_TOKEN, wait_on_rate_limit=True)
        self.rate_tracker = RateLimitTracker()

    def search_keyword(self, keyword: str) -> List:
        wait_time = self.rate_tracker.should_wait()
        if wait_time > 0:
            time.sleep(wait_time)

        location_string = " OR ".join(Config.KENYAN_LOCATIONS[:5])
        query = f'"{keyword}" ({location_string}) -is:retweet lang:en OR lang:sw'
        try:
            response = self.client.search_recent_tweets(
                query=query,
                max_results=Config.MAX_RESULTS,
                tweet_fields=["id", "text", "created_at", "lang"]
            )
            self.rate_tracker.add_request()
            return response.data or []
        except Exception:
            return []

# ============================================================================

class SafeGuardScanner:
    def __init__(self):
        self.db = DatabaseManager()
        self.analyzer = ThreatAnalyzer()
        self.twitter = TwitterClient() if Config.TWITTER_BEARER_TOKEN else None

    def run(self):
        if not self.twitter:
            return

        for keyword in Config.KEYWORDS:
            tweets = self.twitter.search_keyword(keyword)
            self._process_tweets(tweets, keyword)
            time.sleep(random.uniform(*Config.DELAY_BETWEEN_SEARCHES))

    def _process_tweets(self, tweets: List, keyword: str):
        for tweet in tweets:
            threat = self.analyzer.analyze_threat(tweet.text)
            if threat["threat_score"] <= 50:
                continue
            sentiment = self.analyzer.analyze_sentiment(tweet.text)
            entities = self.analyzer.analyze_entities(tweet.text)

            record = {
                "tweet_hash": hashlib.sha256(str(tweet.id).encode()).hexdigest()[:16],
                "keyword_trigger": keyword,
                "content": tweet.text[:500],
                "created_at": str(tweet.created_at),
                "threat_score": threat["threat_score"],
                "threat_category": threat["threat_category"],
                "sentiment_label": sentiment["sentiment"],
                "sentiment_score": sentiment["sentiment_score"],
                "entities": entities,
                "location_boosted": any(loc in tweet.text.lower() for loc in Config.KENYAN_LOCATIONS)
            }
            self.db.save_threat(record)

# ============================================================================

# ----------------------- NEW ADDITIONS FOR MONITORING ----------------------

SCAN_INTERVAL_MINUTES = 15  # adjust as needed

def run_scan():
    print("\n🚀 Starting scan at", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    scanner = SafeGuardScanner()
    scanner.run()
    scanner.db.export_backup()
    print("✅ Scan complete\n")

# Initial scan on startup
run_scan()

# Schedule continuous scans
schedule.every(SCAN_INTERVAL_MINUTES).minutes.do(run_scan)

# Keep running
try:
    while True:
        schedule.run_pending()
        time.sleep(10)
except KeyboardInterrupt:
    print("\n👋 Monitoring stopped by user")
