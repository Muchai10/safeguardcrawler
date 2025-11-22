import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def create_tables():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    
    # Twitter alerts table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS twitter_alerts (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            keyword_found TEXT NOT NULL,
            threat_level INTEGER CHECK (threat_level >= 0 AND threat_level <= 100),
            locations TEXT[],
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # News alerts table  
    cur.execute("""
        CREATE TABLE IF NOT EXISTS news_alerts (
            id SERIAL PRIMARY KEY,
            source_site TEXT NOT NULL,
            article_title TEXT NOT NULL,
            article_url TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            threat_level INTEGER CHECK (threat_level >= 0 AND threat_level <= 20),
            locations TEXT[],
            severity_tier TEXT CHECK (severity_tier IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    create_tables()