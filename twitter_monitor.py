import tweepy
import os
import time
import random
from dotenv import load_dotenv
from database.local_postgres import save_twitter_alert  # ADD THIS

load_dotenv()

# Kenya threat keywords - prioritized
KENYA_KEYWORDS = [
    "nitakupiga", "kukuua", "napiga wewe", 
    "kill you", "attack you", "nitakuchapa"
]

def process_tweet(text: str) -> dict:
    """Simple threat detection for Kenya context"""
    if not text:
        return {"threat_level": 0, "harassment_category": "neutral"}
    
    lower_text = text.lower()
    
    high_threat = ["kill", "kukuua", "attack", "shambulio", "stab", "choma"]
    med_threat = ["beat", "hurt", "napiga", "nitakupiga", "nitakuchapa", "threat"]
    
    threat_level = 0
    category = "neutral"
    
    if any(word in lower_text for word in high_threat):
        threat_level = 75
        category = "high_threat"
    elif any(word in lower_text for word in med_threat):
        threat_level = 60
        category = "threat"
    
    # Boost if Kenya location mentioned
    if any(loc in lower_text for loc in ["nairobi", "kibera", "mathare", "mombasa"]):
        threat_level = min(90, threat_level + 15)
    
    return {"threat_level": threat_level, "harassment_category": category}

def check_api_status():
    """Check if API is available without triggering rate limits"""
    client = tweepy.Client(bearer_token=os.getenv("TWITTER_BEARER_TOKEN"))
    
    print("🔧 Checking API status...")
    try:
        # Use valid max_results (10-100)
        tweets = client.search_recent_tweets(
            query="Nairobi",  # Simple, safe query
            max_results=10,   # Minimum required by Twitter
            tweet_fields=["text"]
        )
        print("✅ API is working! Rate limits reset.")
        return True
    except tweepy.TooManyRequests:
        print("❌ Still rate limited - wait 15 minutes")
        return False
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

def smart_kenya_search():
    """Optimized search with proper rate limiting"""
    client = tweepy.Client(
        bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
        wait_on_rate_limit=True  # Auto-handle rate limits
    )
    
    print("🛡️ SafeGuard Kenya - Optimized Monitoring")
    print("=" * 45)
    
    threats_found = 0
    
    for i, keyword in enumerate(KENYA_KEYWORDS):
        print(f"\n🔍 [{i+1}/{len(KENYA_KEYWORDS)}] Searching: '{keyword}'")
        
        try:
            # Build optimized query
            query = f'"{keyword}" (Kenya OR Nairobi) -is:retweet'
            
            tweets = client.search_recent_tweets(
                query=query,
                max_results=10,  # Minimum required by Twitter API
                tweet_fields=["text", "author_id", "created_at", "lang"]
            )
            
            if tweets.data:
                keyword_threats = 0
                for tweet in tweets.data:
                    analysis = process_tweet(tweet.text)
                    if analysis["threat_level"] > 50:
                        keyword_threats += 1
                        threats_found += 1
                        print(f"🚨 THREAT DETECTED:")
                        print(f"   Text: {tweet.text[:100]}...")
                        print(f"   Level: {analysis['threat_level']}, Type: {analysis['harassment_category']}")
                        
                        # ADD THIS: Save to database
                        save_twitter_alert(
                            username=f"user_{tweet.author_id}",  # Use author_id as username
                            content=tweet.text[:500],  # Limit content length
                            keyword_found=keyword,
                            threat_level=analysis["threat_level"]
                        )
                        print("---")
                
                if keyword_threats > 0:
                    print(f"✅ Found {keyword_threats} threats with '{keyword}'")
                else:
                    print(f"   No threats found with '{keyword}'")
            else:
                print(f"   No tweets found for '{keyword}'")
                
        except Exception as e:
            print(f"   Error: {e}")
        
        # Strategic delay between searches
        if i < len(KENYA_KEYWORDS) - 1:
            delay = random.randint(15, 25)  # Longer delays
            print(f"⏳ Waiting {delay} seconds...")
            time.sleep(delay)
    
    return threats_found

if __name__ == "__main__":
    # Check if API is available
    api_ready = check_api_status()
    
    if api_ready:
        print("\n" + "="*50)
        total_threats = smart_kenya_search()
        print(f"\n📊 SCAN COMPLETE: Found {total_threats} total threats")
    else:
        print("\n💡 API rate limited. Please wait 15 minutes and try again.")