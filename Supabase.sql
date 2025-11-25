-- Create the scraped_articles table with columns matching your scraper's output
CREATE TABLE IF NOT EXISTS scraped_articles (
    id BIGSERIAL PRIMARY KEY,  -- Auto-incrementing ID
    site_url TEXT NOT NULL,    -- Source site (e.g., the-star.co.ke)
    article_url TEXT UNIQUE NOT NULL,  -- Unique URL for upsert conflicts
    title TEXT NOT NULL,       -- Article title
    publish_date DATE,         -- Publication date (nullable if missing)
    keyword_category TEXT DEFAULT 'Other',  -- Category like 'GBV', 'Scams', etc.
    summary_snippet TEXT,      -- First 200 chars snippet
    full_text TEXT,            -- Full article text
    entities TEXT DEFAULT 'None',  -- NER entities (e.g., 'PER: John Doe')
    sentiment TEXT,            -- e.g., 'Positive'
    sentiment_score FLOAT,     -- Score from 0-1
    created_at TIMESTAMP DEFAULT NOW()  -- Auto-timestamp for insertion time
);

-- Optional: Enable Row Level Security (RLS) if you want access controls later
-- ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;

-- Optional: Create an index on article_url for faster upserts/queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_scraped_articles_url ON scraped_articles (article_url);








-- 1. Create the dashboard table (one row per day)
CREATE TABLE IF NOT EXISTS dashboard (
    date DATE PRIMARY KEY,                    -- The day this row represents (e.g., 2025-11-25)
    
    total_articles BIGINT DEFAULT 0,
    
    articles_today BIGINT DEFAULT 0,
    articles_this_week BIGINT DEFAULT 0,
    
    -- Category counts
    gbv_count BIGINT DEFAULT 0,
    scams_count BIGINT DEFAULT 0,
    politics_count BIGINT DEFAULT 0,
    business_count BIGINT DEFAULT 0,
    other_count BIGINT DEFAULT 0,
    
    -- Sentiment
    avg_sentiment_score FLOAT DEFAULT 0,
    positive_count BIGINT DEFAULT 0,
    neutral_count BIGINT DEFAULT 0,
    negative_count BIGINT DEFAULT 0,
    
    -- Entity mentions (simple count of articles that mention at least one)
    person_mentions BIGINT DEFAULT 0,
    organization_mentions BIGINT DEFAULT 0,
    location_mentions BIGINT DEFAULT 0,
    
    -- Per-site daily counts
    "tuko.co.ke" BIGINT DEFAULT 0,
    "citizen.digital" BIGINT DEFAULT 0,
    "pressrelease.co.ke" BIGINT DEFAULT 0,
    "nation.africa" BIGINT DEFAULT 0,
    "standardmedia.co.ke" BIGINT DEFAULT 0,
    "mpasho.co.ke" BIGINT DEFAULT 0,
    "pulselive.co.ke" BIGINT DEFAULT 0,
    "kenyans.co.ke" BIGINT DEFAULT 0,
    "the-star.co.ke" BIGINT DEFAULT 0,
    "nairobileo.co.ke" BIGINT DEFAULT 0,
    "ghafla.co.ke" BIGINT DEFAULT 0,
    "kiswahili.tuko.co.ke" BIGINT DEFAULT 0,
    "swahili.kbc.co.ke" BIGINT DEFAULT 0,
    "habarinow.com" BIGINT DEFAULT 0,
    "corofm.kbc.co.ke" BIGINT DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Function that recalculates the entire dashboard row for a given date
CREATE OR REPLACE FUNCTION refresh_dashboard_for_date(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO dashboard (date, total_articles, articles_today, articles_this_week,
        gbv_count, scams_count, politics_count, business_count, other_count,
        avg_sentiment_score, positive_count, neutral_count, negative_count,
        person_mentions, organization_mentions, location_mentions,
        "tuko.co.ke", "citizen.digital", "pressrelease.co.ke", "nation.africa",
        "standardmedia.co.ke", "mpasho.co.ke", "pulselive.co.ke", "kenyans.co.ke",
        "the-star.co.ke", "nairobileo.co.ke", "ghafla.co.ke", "kiswahili.tuko.co.ke",
        "swahili.kbc.co.ke", "habarinow.com", "corofm.kbc.co.ke")
    SELECT
        target_date AS date,
        
        -- Total ever
        COUNT(*) AS total_articles,
        
        -- Today & this week
        COUNT(*) FILTER (WHERE DATE(created_at) = target_date) AS articles_today,
        COUNT(*) FILTER (WHERE created_at >= target_date - INTERVAL '6 days') AS articles_this_week,
        
        -- Categories
        COUNT(*) FILTER (WHERE keyword_category ILIKE 'GBV') AS gbv_count,
        COUNT(*) FILTER (WHERE keyword_category ILIKE 'Scams') AS scams_count,
        COUNT(*) FILTER (WHERE keyword_category ILIKE 'Politics') AS politics_count,
        COUNT(*) FILTER (WHERE keyword_category ILIKE 'Business') AS business_count,
        COUNT(*) FILTER (WHERE keyword_category NOT IN ('GBV','Scams','Politics','Business') 
                         OR keyword_category = 'Other' OR keyword_category IS NULL) AS other_count,
        
        -- Sentiment
        COALESCE(AVG(sentiment_score), 0)::FLOAT AS avg_sentiment_score,
        COUNT(*) FILTER (WHERE sentiment ILIKE 'Positive') AS positive_count,
        COUNT(*) FILTER (WHERE sentiment ILIKE 'Neutral') AS neutral_count,
        COUNT(*) FILTER (WHERE sentiment ILIKE 'Negative') AS negative_count,
        
        -- Entities (count articles that contain the entity type)
        COUNT(*) FILTER (WHERE entities ILIKE '%PER:%') AS person_mentions,
        COUNT(*) FILTER (WHERE entities ILIKE '%ORG:%') AS organization_mentions,
        COUNT(*) FILTER (WHERE entities ILIKE '%LOC:%') AS location_mentions,
        
        -- Per-site counts for TODAY only (change filter to remove date condition if you want all-time)
        COUNT(*) FILTER (WHERE site_url LIKE '%tuko.co.ke%' AND DATE(created_at) = target_date) AS "tuko.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%citizen.digital%' AND DATE(created_at) = target_date) AS "citizen.digital",
        COUNT(*) FILTER (WHERE site_url LIKE '%pressrelease.co.ke%' AND DATE(created_at) = target_date) AS "pressrelease.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%nation.africa%' AND DATE(created_at) = target_date) AS "nation.africa",
        COUNT(*) FILTER (WHERE site_url LIKE '%standardmedia.co.ke%' AND DATE(created_at) = target_date) AS "standardmedia.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%mpasho.co.ke%' AND DATE(created_at) = target_date) AS "mpasho.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%pulselive.co.ke%' AND DATE(created_at) = target_date) AS "pulselive.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%kenyans.co.ke%' AND DATE(created_at) = target_date) AS "kenyans.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%the-star.co.ke%' AND DATE(created_at) = target_date) AS "the-star.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%nairobileo.co.ke%' AND DATE(created_at) = target_date) AS "nairobileo.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%ghafla.co.ke%' AND DATE(created_at) = target_date) AS "ghafla.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%kiswahili.tuko.co.ke%' AND DATE(created_at) = target_date) AS "kiswahili.tuko.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%swahili.kbc.co.ke%' AND DATE(created_at) = target_date) AS "swahili.kbc.co.ke",
        COUNT(*) FILTER (WHERE site_url LIKE '%habarinow.com%' AND DATE(created_at) = target_date) AS "habarinow.com",
        COUNT(*) FILTER (WHERE site_url LIKE '%corofm.kbc.co.ke%' AND DATE(created_at) = target_date) AS "corofm.kbc.co.ke"
        
    FROM scraped_articles
    ON CONFLICT (date) DO UPDATE SET
        total_articles = EXCLUDED.total_articles,
        articles_today = EXCLUDED.articles_today,
        articles_this_week = EXCLUDED.articles_this_week,
        gbv_count = EXCLUDED.gbv_count,
        scams_count = EXCLUDED.scams_count,
        politics_count = EXCLUDED.politics_count,
        business_count = EXCLUDED.business_count,
        other_count = EXCLUDED.other_count,
        avg_sentiment_score = EXCLUDED.avg_sentiment_score,
        positive_count = EXCLUDED.positive_count,
        neutral_count = EXCLUDED.neutral_count,
        negative_count = EXCLUDED.negative_count,
        person_mentions = EXCLUDED.person_mentions,
        organization_mentions = EXCLUDED.organization_mentions,
        location_mentions = EXCLUDED.location_mentions,
        "tuko.co.ke" = EXCLUDED."tuko.co.ke",
        "citizen.digital" = EXCLUDED."citizen.digital",
        "pressrelease.co.ke" = EXCLUDED."pressrelease.co.ke",
        "nation.africa" = EXCLUDED."nation.africa",
        "standardmedia.co.ke" = EXCLUDED."standardmedia.co.ke",
        "mpasho.co.ke" = EXCLUDED."mpasho.co.ke",
        "pulselive.co.ke" = EXCLUDED."pulselive.co.ke",
        "kenyans.co.ke" = EXCLUDED."kenyans.co.ke",
        "the-star.co.ke" = EXCLUDED."the-star.co.ke",
        "nairobileo.co.ke" = EXCLUDED."nairobileo.co.ke",
        "ghafla.co.ke" = EXCLUDED."ghafla.co.ke",
        "kiswahili.tuko.co.ke" = EXCLUDED."kiswahili.tuko.co.ke",
        "swahili.kbc.co.ke" = EXCLUDED."swahili.kbc.co.ke",
        "habarinow.com" = EXCLUDED."habarinow.com",
        "corofm.kbc.co.ke" = EXCLUDED."corofm.kbc.co.ke",
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger: Automatically refresh today's dashboard row on every change to scraped_articles
CREATE OR REPLACE FUNCTION trigger_refresh_dashboard()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_dashboard_for_date(CURRENT_DATE);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists (safe to run multiple times)
DROP TRIGGER IF EXISTS trg_refresh_dashboard ON scraped_articles;

CREATE TRIGGER trg_refresh_dashboard
    AFTER INSERT OR UPDATE OR DELETE ON scraped_articles
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_dashboard();

-- 4. Initial population (run once) - creates today's row and backfills last 30 days if you want
DO $$
BEGIN
    PERFORM refresh_dashboard_for_date(CURRENT_DATE);
    -- Optional: backfill last 30 days
    FOR i IN 0..30 LOOP
        PERFORM refresh_dashboard_for_date(CURRENT_DATE - i);
    END LOOP;
END $$;