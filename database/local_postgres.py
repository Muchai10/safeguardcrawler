import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def save_twitter_alert(username, content, keyword_found, threat_level):
    """Save Twitter alert to local PostgreSQL"""
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO twitter_alerts (username, content, keyword_found, threat_level)
            VALUES (%s, %s, %s, %s)
        """, (username, content, keyword_found, threat_level))
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Twitter alert saved to database: {username}")
    except Exception as e:
        print(f"❌ Database error: {e}")

def save_news_alert(source_site, article_title, article_url, content, threat_level, locations, severity_tier):
    """Save News alert to local PostgreSQL with upsert logic"""
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO news_alerts 
                (source_site, article_title, article_url, content, threat_level, locations, severity_tier, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (article_url) 
            DO UPDATE SET 
                threat_level = EXCLUDED.threat_level,
                severity_tier = EXCLUDED.severity_tier,
                updated_at = NOW()
            RETURNING id;
        """, (source_site, article_title, article_url, content, threat_level, locations, severity_tier))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if result:
            print(f"✅ Saved/Updated alert: {article_title[:50]}...")
        else:
            print(f"⏭️ Already in database: {article_title[:50]}...")
            
    except Exception as e:
        if "duplicate key" in str(e).lower():
            print(f"⏭️ Already marked: {article_title[:50]}...")
        else:
            print(f"❌ Database error: {e}")