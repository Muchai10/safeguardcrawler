import os
import warnings
import time
import schedule
from datetime import datetime
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
load_dotenv()


import pandas as pd
import tweepy


try:
    from transformers import pipeline
    SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    sentiment_pipeline = pipeline("sentiment-analysis", model=SENTIMENT_MODEL)
    print("✅ Transformers loaded - sentiment analysis ready!")
except ImportError as e:
    print(f"⚠️ Install transformers: pip install transformers torch")
    sentiment_pipeline = None
except Exception as e:
    print(f"⚠️ Failed to load sentiment model: {e}")
    sentiment_pipeline = None


from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️ Supabase credentials not found in environment variables")
    print("   Please set SUPABASE_URL and SUPABASE_KEY in .env file")
    supabase = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized - database ready.")
    except Exception as e:
        print(f"❌ Supabase init failed: {e}")
        supabase = None


TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

# Kenya threat keywords - prioritized
KENYA_KEYWORDS = [
    "nitakupiga", "kukuua", "napiga wewe",
    "kill you", "attack you", "nitakuchapa"
]


SCAN_INTERVAL_MINUTES = 15
MAX_TWEETS_PER_KEYWORD = 10
MAX_DAILY_SCANS = 96



def categorize_threat(text):
    """
    Categorizing tweets based on threat keywords - borrowed from news scraper's categorize_article logic
    """
    if not text:
        return "neutral"

    text_lower = text.lower()

    # English + Swahili threat keywords
    high_threat = ['kill', 'kukuua', 'attack', 'shambulio', 'stab', 'choma', 'murder']
    med_threat = ['beat', 'hurt', 'napiga', 'nitakupiga', 'nitakuchapa', 'threat', 'harm']
    low_threat = ['insult', 'matusi', 'stupid', 'idiot']

    # Scoring similar to news scraper
    if any(word in text_lower for word in high_threat):
        return "high_threat"
    elif any(word in text_lower for word in med_threat):
        return "threat"
    elif any(word in text_lower for word in low_threat):
        return "harassment"

    return "neutral"


def analyze_tweet(text):
    """
    Running sentiment analysis on tweet - borrowed from news scraper's analyze_article
    """
    if sentiment_pipeline is None:
        return {"sentiment": "N/A", "sentiment_score": 0.0, "threat_level": 0}

    try:
        # Sentiment on first 512 chars (same as news scraper)
        sent_text = text[:512]
        sent = sentiment_pipeline(sent_text)[0]
        sentiment_label = sent['label'].capitalize()
        sentiment_score = round(sent['score'], 3)

        # Calculate threat level (0-100)
        category = categorize_threat(text)
        threat_map = {"high_threat": 85, "threat": 65, "harassment": 40, "neutral": 0}
        threat_level = threat_map.get(category, 0)

        # Boost if Kenya location mentioned (like news scraper's category boost)
        kenya_locations = ["nairobi", "kibera", "mathare", "mombasa", "kisumu", "nakuru"]
        if any(loc in text.lower() for loc in kenya_locations):
            threat_level = min(95, threat_level + 10)

        return {
            "sentiment": sentiment_label,
            "sentiment_score": sentiment_score,
            "threat_level": threat_level,
            "threat_category": category
        }
    except Exception as e:
        print(f"⚠️ Analysis error: {e}")
        return {"sentiment": "N/A", "sentiment_score": 0.0, "threat_level": 0, "threat_category": "neutral"}


def check_api_status():
    """Check if Twitter API is available"""
    if not TWITTER_BEARER_TOKEN:
        print("❌ TWITTER_BEARER_TOKEN not found in environment")
        print("   Please set it in your .env file")
        return False

    client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)

    print("🔧 Checking Twitter API status...")
    try:
        client.search_recent_tweets(query="Kenya", max_results=10, tweet_fields=["text"])
        print("✅ Twitter API is working!")
        return True
    except tweepy.TooManyRequests:
        print("❌ Rate limited - wait 15 minutes")
        return False
    except tweepy.Unauthorized:
        print("❌ Invalid API credentials")
        return False
    except Exception as e:
        print(f"❌ API error: {e}")
        return False



def main_twitter_scraper():
    """
    Main scraper - pattern borrowed from news scraper's main_scraper function
    Searches keywords, analyzes tweets, collects into DataFrame
    """
    if not TWITTER_BEARER_TOKEN:
        print("❌ TWITTER_BEARER_TOKEN not set")
        return pd.DataFrame()

    data = []  # List to hold all tweet dicts (like news scraper)

    client = tweepy.Client(
        bearer_token=TWITTER_BEARER_TOKEN,
        wait_on_rate_limit=True
    )

    print("\n🛡️ SafeGuard Kenya - Twitter Monitoring")
    print("=" * 50)
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Loop through keywords (like news scraper loops through sites)
    for i, keyword in enumerate(KENYA_KEYWORDS):
        print(f"\n🔍 [{i+1}/{len(KENYA_KEYWORDS)}] Searching: '{keyword}'")

        try:
            # Build query (similar to news scraper's URL extraction)
            query = f'"{keyword}" (Kenya OR Nairobi OR Mombasa) -is:retweet lang:en'

            tweets = client.search_recent_tweets(
                query=query,
                max_results=MAX_TWEETS_PER_KEYWORD,
                tweet_fields=["text", "author_id", "created_at", "lang"]
            )

            if tweets.data:
                for tweet in tweets.data:
                    text = tweet.text.strip()

                    # Skip very short tweets (like news scraper skips short articles)
                    if len(text) < 20:
                        continue

                    # Categorize and analyze (borrowed pattern)
                    analysis = analyze_tweet(text)

                    # Only save tweets with threat_level > 50 (filtering like news scraper)
                    if analysis["threat_level"] > 50:
                        data.append({
                            "keyword_searched": keyword,
                            "tweet_url": f"https://twitter.com/user/status/{tweet.id}",
                            "username": f"user_{tweet.author_id}",
                            "content": text[:500],  # Limit like news scraper
                            "created_at": tweet.created_at,
                            "threat_category": analysis["threat_category"],
                            "threat_level": analysis["threat_level"],
                            "sentiment": analysis["sentiment"],
                            "sentiment_score": analysis["sentiment_score"]
                        })
                        print(f"🚨 THREAT: {text[:60]}... (Level: {analysis['threat_level']})")

                print(f"✅ Processed {len(tweets.data)} tweets for '{keyword}'")
            else:
                print(f"ℹ️ No tweets found for '{keyword}'")

            # Polite delay between searches (like news scraper)
            if i < len(KENYA_KEYWORDS) - 1:
                time.sleep(3)

        except Exception as e:
            print(f"❌ Error searching '{keyword}': {e}")
            continue

    print(f"\n✅ Scraping complete. Found {len(data)} threats.")
    return pd.DataFrame(data) if data else pd.DataFrame()



def upload_to_supabase(df):
    """
    Upload to Supabase - exact same pattern as news scraper's upload function
    """
    if df.empty:
        print("ℹ️ No data to upload")
        return

    if supabase is None:
        print("⚠️ Supabase not initialized. Skipping upload.")
        print("   Data saved to CSV only.")
        return

    # Format dates
    df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')

    # Ensure columns match schema
    cols = ["keyword_searched", "tweet_url", "username", "content", "created_at",
            "threat_category", "threat_level", "sentiment", "sentiment_score"]
    final_df = df[cols].copy()

    # Convert to records
    records = final_df.to_dict(orient="records")

    # Local backup (like news scraper)
    final_df.to_csv("twitter_threats.csv", index=False, encoding="utf-8")
    print(f"💾 Saved backup: twitter_threats.csv ({len(final_df)} threats)")

    # Upsert to Supabase
    try:
        response = supabase.table("twitter_alerts").upsert(records, on_conflict="tweet_url").execute()
        print(f"✅ Uploaded {len(records)} records to 'twitter_alerts' table")
    except Exception as e:
        print(f"❌ Supabase upload failed: {e}")
        print("   Data is saved in CSV file.")

def run_scheduled_scan():
    """Single scan execution - called by scheduler"""
    print("\n" + "="*70)
    print(f"🚀 Starting scan at {datetime.now().strftime('%H:%M:%S')}")
    print("="*70)

    # Check API first
    if not check_api_status():
        print("⏳ API not ready - skipping this scan")
        return

    # Run scraper
    df = main_twitter_scraper()

    # Upload results
    if not df.empty:
        upload_to_supabase(df)

    # Next scan info
    next_run = datetime.now().replace(second=0, microsecond=0)
    next_run = next_run.replace(minute=(next_run.minute // SCAN_INTERVAL_MINUTES + 1) * SCAN_INTERVAL_MINUTES % 60)
    if next_run.minute == 0:
        next_run = next_run.replace(hour=(next_run.hour + 1) % 24)
    print(f"\n⏰ Next scan scheduled for: {next_run.strftime('%H:%M:%S')}")



if __name__ == "__main__":
    print("="*70)
    print("🛡️ SafeGuard Kenya - Twitter Threat Monitor")
    print("="*70)
    print(f"📋 Scan Interval: Every {SCAN_INTERVAL_MINUTES} minutes")
    print(f"📊 Daily Limit: {MAX_DAILY_SCANS} scans")
    print(f"⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)

    # Schedule the job
    schedule.every(SCAN_INTERVAL_MINUTES).minutes.do(run_scheduled_scan)

    # Run immediately on startup
    print("\n🚀 Running initial scan...")
    run_scheduled_scan()

    # Keep running
    try:
        scan_count = 0
        while True:
            schedule.run_pending()
            time.sleep(30)  # Check every 30 seconds

            # Daily limit check
            scan_count += 1
            if scan_count >= MAX_DAILY_SCANS:
                print(f"\n⏸️ Daily scan limit reached ({MAX_DAILY_SCANS})")
                print("Waiting until midnight to reset...")
                time.sleep(3600)  # Wait an hour then check again

    except KeyboardInterrupt:
        print("\n\n👋 Monitoring stopped by user")
        print(f"⏰ Stopped at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")