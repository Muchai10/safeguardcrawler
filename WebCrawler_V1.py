import os
import warnings
import time
from datetime import datetime
from urllib.parse import urljoin, urlparse

# I'm suppressing warnings right at the start so my console stays clean during runs
warnings.filterwarnings("ignore")
# I'm also setting this env var to avoid tokenizer issues in parallel processing
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Core imports for data handling and scraping
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from newspaper import Article
import nltk
from nltk.tokenize import sent_tokenize
from bs4 import BeautifulSoup

# NLP imports with fallback if transformers aren't installed – I'm handling this gracefully
try:
    from transformers import pipeline

    NER_MODEL = "Davlan/bert-base-multilingual-cased-ner-hrl"
    SENTIMENT_MODEL = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    ner_pipeline = pipeline("ner", model=NER_MODEL, aggregation_strategy="simple")
    sentiment_pipeline = pipeline("sentiment-analysis", model=SENTIMENT_MODEL)
    print("Transformers pipelines loaded successfully – NER and sentiment are ready!")
except ImportError as e:
    print(f"Error: Install transformers with 'pip install transformers torch'. Details: {e}")
    ner_pipeline = None
    sentiment_pipeline = None
except Exception as e:
    print(f"Warning: Failed to load transformers pipelines: {e}")
    ner_pipeline = None
    sentiment_pipeline = None

# NLTK setup – I'm ensuring the punkt tokenizer is available for sentence splitting
try:
    nltk.data.find('tokenizers/punkt')
    print("NLTK 'punkt' data found – good to go.")
except LookupError:
    nltk.download('punkt', quiet=True)
    print("Downloaded NLTK 'punkt' data – now we're set.")

# -------------------------- Supabase Client Setup --------------------------
# I'm initializing the Supabase client for storing my scraped data
# For local runs in PyCharm, use env vars or hardcode temporarily
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://aanenqfgmnuosyfbfxbk.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_secret_rZc47DbEIZpLf2nRrnj6ZA_FImuYy0C")  # Service role key
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Supabase client initialized successfully – database ready for uploads.")
except Exception as e:
    print(f"Supabase init failed: {e}. Check URL/key.")
    supabase = None


# -------------------------- Helper Functions for Categorization and Analysis --------------------------
def categorize_article(text):
    """
    I'm categorizing the article based on keywords in sentences – now including Swahili and Kikuyu terms for better coverage in Kenyan contexts.
    This helps flag GBV, Cyberbullying, or Scams articles.
    """
    if not text:
        return "Other"
    # I'm tokenizing the text into sentences and lowercasing for case-insensitive matching
    sentences = sent_tokenize(text.lower())
    scores = {"GBV": 0, "Cyberbullying": 0, "Scams": 0}

    # English keywords – original set
    gbv_keywords = ['gender based violence', 'gbv', 'domestic violence', 'femicide', 'sexual harassment']
    cyber_keywords = ['cyberbullying', 'online harassment', 'trolling', 'social media abuse']
    scam_keywords = ['scam', 'fraud', 'phishing', 'fake investment']

    # Swahili keywords – added for local language coverage
    gbv_keywords += ['unyanyasaji wa kijinsia', 'unyanyasaji wa nyumbani', 'unyanyasi wa jinsia', 'vurugu za kijinsia']
    cyber_keywords += ['ubaguzi wa kidijitali', 'unyanyasaji wa mtandaoni', 'unyanyasaji']
    scam_keywords += ['udanganyifu', 'utapeli', 'mdanganyifu', 'ghashi']

    # Kikuyu keywords – limited terms available, but adding what fits for violence/harassment/scams
    gbv_keywords += ['kĩũra rũga', 'kĩũra']  # 'kĩũra rũga' for relational violence, 'kĩũra' for harm
    cyber_keywords += ['kagege']  # Term related to derogatory harassment
    scam_keywords += ['scam', 'laghai']  # 'laghai' for deceit, borrowing from similar contexts

    # I'm scanning each sentence and incrementing scores based on keyword matches
    for s in sentences:
        if any(k in s for k in gbv_keywords):
            scores["GBV"] += 1
        if any(k in s for k in cyber_keywords):
            scores["Cyberbullying"] += 1
        if any(k in s for k in scam_keywords):
            scores["Scams"] += 1

    # Picking the category with the highest score, default to "Other" if none match
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "Other"


def extract_article_links(html, base_url, max_links=10):
    """
    I'm extracting article links from the HTML soup – limiting to same domain and paths like /news/, /article/, etc.
    Now set to top 10 per site as requested.
    """
    # Parsing the HTML with BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    links = set()  # Using a set to avoid duplicates
    # Path indicators for news/article paths – this filters for relevant content
    path_indicators = ["/news/", "/article/", "/story/", "/kenya/", "/swahili/",
                       "/kikuyu/"]  # Added more for Kenyan/Swahili/Kikuyu sites

    # Finding all <a> tags with href
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)
        # Checking if same domain and path matches indicators
        if (parsed.netloc == urlparse(base_url).netloc and
                any(indicator in full_url.lower() for indicator in path_indicators)):
            links.add(full_url)
            if len(links) >= max_links:
                break

    print(f"Extracted {len(links)} unique links matching criteria.")
    return list(links)[:max_links]


def analyze_article(text):
    """
    I'm running NER (Named Entity Recognition) and sentiment analysis on the text.
    Using transformers pipelines with fallbacks if not available.
    Limiting text length to avoid model limits.
    """
    if ner_pipeline is None or sentiment_pipeline is None:
        return {"entities": "Analysis unavailable - install transformers", "sentiment": "N/A", "sentiment_score": 0.0}

    try:
        # NER on first 1400 chars, filtering high-confidence entities
        ner_text = text[:1400]
        ents = ner_pipeline(ner_text)
        entities = " | ".join(set([f"{e['entity_group']}: {e['word']}" for e in ents if e['score'] > 0.8]))
        entities = entities or "None"

        # Sentiment on first 512 chars
        sent_text = text[:512]
        sent = sentiment_pipeline(sent_text)[0]
        sentiment_label = sent['label'].capitalize()
        sentiment_score = round(sent['score'], 3)

        return {"entities": entities, "sentiment": sentiment_label, "sentiment_score": sentiment_score}
    except Exception as e:
        print(f"Analysis error: {e}")
        return {"entities": "Error", "sentiment": "N/A", "sentiment_score": 0.0}


# -------------------------- Main Scraper Function --------------------------
def main_scraper(site_urls=[
    'https://www.tuko.co.ke',
    'https://www.citizen.digital',
    'https://pressrelease.co.ke',
    'https://nation.africa/kenya',
    'https://standardmedia.co.ke/',
    'https://www.mpasho.co.ke/',
    'https://www.pulselive.co.ke/',
    'https://www.kenyans.co.ke/',
    'https://www.the-star.co.ke/',
    'https://nairobileo.co.ke/',
    'https://www.ghafla.co.ke/ke/',
    # Swahili sites
    'https://kiswahili.tuko.co.ke/',
    'https://swahili.kbc.co.ke/',
    'https://habarinow.com/',
    # Kikuyu site
    'https://corofm.kbc.co.ke/'
], max_articles=10):
    """
    This is the heart of my scraper – loading sites with Selenium, extracting links, parsing articles with Newspaper3k,
    filtering recent ones (<30 days), categorizing, analyzing, and collecting into a DataFrame.
    Now scraping top 10 articles per site, and including all the requested Kenyan/Swahili/Kikuyu sites.
    """
    data = []  # List to hold all article dicts

    # Selenium setup – I'm configuring headless Chrome to run invisibly and stealthily
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = None
    try:
        # Initializing the Chrome driver with webdriver-manager for auto-updates
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        # Hiding the webdriver property to avoid detection
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => false});")
        print("Chrome driver initialized in headless mode – ready to browse.")
    except Exception as e:
        print(f"Failed to init Chrome: {e}. Install Chrome and run 'pip install selenium webdriver-manager'.")
        return pd.DataFrame()

    # Looping through each site in the expanded list
    for site in site_urls:
        print(f"\n--- Loading site: {site} ---")
        try:
            # Getting the site page
            driver.get(site)
            # Waiting for body to load
            WebDriverWait(driver, 60).until(EC.presence_of_element_located(("tag name", "body")))
            time.sleep(10)  # Brief pause to let dynamic content load

            # Extracting links specific to this site
            html = driver.page_source
            links = extract_article_links(html, site, max_articles)

            # Processing each link
            for url in links:
                try:
                    print(f"Fetching article: {url}")
                    # Downloading and parsing with Newspaper3k
                    article = Article(url)
                    article.download()
                    time.sleep(2)  # Polite delay between requests
                    article.parse()

                    # Skipping old articles – only recent (<30 days)
                    if article.publish_date:
                        age_days = (datetime.now() - article.publish_date).days
                        if age_days > 30:
                            print(f"Skipping old article (age: {age_days} days)")
                            continue

                    # Skipping very short articles
                    text = article.text.strip()
                    if len(text) < 150:
                        print("Skipping short article (<150 chars)")
                        continue

                    # Categorizing based on keywords (now multilingual)
                    category = categorize_article(text)

                    # Running NLP analysis
                    analysis = analyze_article(text)

                    # Preparing publish date
                    pub_date = article.publish_date.date() if article.publish_date else None

                    # Appending to data list
                    data.append({
                        "site_url": site,
                        "article_url": url,
                        "title": article.title.strip() if article.title else "No title",
                        "publish_date": pub_date,
                        "keyword_category": category,
                        "summary_snippet": (text[:200] + "...") if len(text) > 200 else text,
                        "full_text": text,
                        "entities": analysis["entities"],
                        "sentiment": analysis["sentiment"],
                        "sentiment_score": analysis["sentiment_score"]
                    })
                    print(f"Added analyzed article: {article.title[:50]}... (Category: {category})")
                except Exception as e:
                    print(f"Error processing {url}: {e}")
                    continue
        except Exception as e:
            print(f"Failed to load site {site}: {e}")
            continue

    # Cleaning up the driver
    if driver:
        driver.quit()

    print(f"\nScraping complete. Collected {len(data)} articles across all sites.")
    return pd.DataFrame(data) if data else pd.DataFrame()


# -------------------------- Upload to Supabase Function --------------------------
def upload_to_supabase(df):
    """
    I'm upserting the DataFrame to Supabase 'scraped_articles' table, using article_url as conflict key to avoid duplicates.
    Also saving a local CSV backup.
    """
    if df.empty:
        print("No data to upload – nothing scraped.")
        return

    if supabase is None:
        print("Supabase not initialized. Skipping upload.")
        return

    # Cleaning and formatting publish_date to JSON-safe strings
    df['publish_date'] = pd.to_datetime(df['publish_date'], errors='coerce')
    df['publish_date'] = df['publish_date'].dt.strftime('%Y-%m-%d').where(pd.notna(df['publish_date']), None)

    # Ensuring columns match the table schema
    cols = ["site_url", "article_url", "title", "publish_date", "keyword_category",
            "summary_snippet", "full_text", "entities", "sentiment", "sentiment_score"]
    final_df = df[cols].copy()

    # Converting to list of dicts for Supabase
    records = final_df.to_dict(orient="records")

    # Local backup – always save CSV for safety
    final_df.to_csv("scraped_articles.csv", index=False, encoding="utf-8")
    print(f"Saved local backup: scraped_articles.csv ({len(final_df)} articles)")

    # Upsert to Supabase
    try:
        response = supabase.table("scraped_articles").upsert(records, on_conflict="article_url").execute()
        inserted_count = len(response.data) if response.data else 0
        print(f"SUCCESS: Uploaded {len(records)} records to 'scraped_articles' table.")
        if inserted_count == 0:
            print("No new inserts—likely all duplicates or check response for errors.")
        else:
            print("Data saved! Refresh Supabase Table Editor to see it.")
    except Exception as e:
        print(f"Supabase upload failed: {e}")
        print("Troubleshoot: Does the table exist? Columns match? Service key has INSERT perms?")


# -------------------------- Main Execution --------------------------
if __name__ == "__main__":
    print("=== My Upgraded Article Scraper & Analyzer Starting (Target: scraped_articles table) ===")
    print(f"Current date/time: {datetime.now()} – scraping recent articles only.")

    # Running the scraper with expanded sites and top 10 per site
    raw_df = main_scraper(max_articles=10)

    if raw_df.empty:
        print(
            "No articles scraped. Check: Sites up? Adjust path_indicators in extract_article_links? Increase timeouts?")
    else:
        print(f"\nUploading {len(raw_df)} analyzed articles to Supabase...")
        upload_to_supabase(raw_df)

    print("\n=== All done! Check CSV file and Supabase 'scraped_articles' table. ===")
