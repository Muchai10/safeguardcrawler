# SafeGuard Crawler

> **Early signals, safer spaces**

SafeGuard Crawler is an ethical, AI-powered early-warning system that detects **emerging GBV threats, cyber-harassment, sextortion patterns, and online misinformation** in Kenyan digital spaces.
It provides **4–6 hours of lead time** before harmful narratives escalate — enabling rapid response by NGOs, campus safety, newsroom moderators, and gender protection teams.

---

# Key Idea

> Safe, context-aware AI can close the detection gap between when harm starts and when humans finally see it.

SafeGuard Crawler works by:

* Crawling **permitted public sources** while respecting `robots.txt` & platform policies
* Using **multilingual AI models** tuned for English, Kiswahili, and Sheng
* Detecting early signals of **harassment, harm, sextortion, coordinated narratives, and misinformation**
* Mapping **geospatial hotspots** using location NER + PostGIS
* Sending **explainable alerts** to responders
* Enforcing **strict privacy, PII redaction, and ethical monitoring**

---

# Tech Stack

## **Frontend**

* **React + TypeScript** — fast, scalable dashboard & analyst tools
* **Tailwind CSS** — clean, responsive UI for maps, alerts & insights

## **AI / Machine Learning**

* **Ollama (Mistral, Llama 3)** — fast local inference, translation, summarization, explanation
* **Hugging Face Models** — harm detection, NER, embeddings, burst detection

## **Database**

* **PostgreSQL (Supabase)** — primary DB for signals, alerts, audit logs
* **PostGIS** — geospatial clustering and hotspot analytics

## **Search**

* **Elasticsearch** — high-speed indexing & retrieval for 100k+ articles, posts, and patterns

---

# System Architecture (High-Level)

### 1. **Crawling Layer**

* Scrapy / Playwright crawlers
* Strict rate-limits & source whitelisting
* Screenshots & metadata for evidence

### 2. **Processing & NLP Layer**

* Text cleaning, language detect
* Harm classifier (GBV, harassment, hate speech)
* Sextortion / scam pattern detector
* NER → Location extraction
* Sentiment + narrative burst detection

### 3. **Scoring & Triage Engine**

* Hybrid ML + rule-based severity scoring
* Explainability (LLM-generated summaries & reasoning)

### 4. **Storage**

* Supabase PostgreSQL (structured)
* PostGIS for geo clustering
* Elasticsearch for full-text, fuzzy, and semantic search

### 5. **API Layer**

* FastAPI / Node API for:

  * `/signals`
  * `/alerts`
  * `/hotspots`
  * `/sextortion`
  * `/search`
  * `/auth`

### 6. **Dashboard**

* Map-based hotspot explorer
* Severity heatmaps
* Full-text search across signals
* Alert center + case details

### 7. **Alerting**

* Email
* SMS
* WhatsApp (Meta API)
* Slack
* Custom webhooks

(Architecture diagrams and expanded explanations are in the attached PDF.)


---

# Data Pipeline

1. **Fetch** sources (news, blogs, public posts)
2. **Normalize** text & metadata
3. **Detect harm signals** using multilingual models
4. **Extract locations** using NER
5. **Geocode** + store in PostGIS
6. **Score severity** (High, Medium, Low)
7. **Route alerts** based on category + confidence
8. **Display** in dashboard
9. **Archive/expire** content (short retention)

---

# Use Cases

### NGOs & GBV Helplines

* Detect new harassment patterns
* Identify hotspots for intervention
* Allocate response resources faster

### Campuses & Youth Programs

* Identify stalking, threats, sextortion targeting students
* Campus-specific hotspot maps

### Newsrooms

* Detect coordinated misinformation
* Track trending harmful narratives

### County Gender Desks

* Real-time community-level GBV trends
* County-level hotspot insights

---

# Model Capabilities

### Harm Detection

* Bullying / harassment
* GBV-related hate
* Threats of violence
* Impersonation, doxxing
* Sextortion patterns & blackmail

### Language Support

* English
* Kiswahili
* Kikuyu

### Explainability

* LLM-generated summaries:

  * “Why was this flagged?”
  * “What is the risk level?”
  * “What location and actors were mentioned?”

---

# Quickstart (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/your-org/safeguard-crawler
cd safeguard-crawler
```

---

## Backend Setup (FastAPI or Node)

### Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Run API:

```bash
uvicorn app.main:app --reload
```

Environment variables:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ELASTICSEARCH_URL=
OLLAMA_HOST=
```

---

## Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

## Crawler Setup

```bash
cd crawler
scrapy crawl sources_spider
```

---

# Hotspot Mapping

Hotspots are computed using:

* Location NER (HuggingFace / spaCy)
* Gazetteer matching
* Geocoding
* PostGIS DBSCAN clustering

Displayed using:

* React Leaflet
* GeoJSON overlays
* Heatmaps
* Time filters

---

# Alert Routing

### High Severity (Auto-Forward)

* Partner NGOs
* Security teams
* Campus hotlines
* GBV rapid-response teams

### Medium Severity

* Human moderation queue

### Low Severity

* Logged for analytics only

Delivery channels:

* Email distribution lists for NGOs (alerts@org.org)
* SMS
* WhatsApp
  
---

# Security, Ethics & Compliance

*  Only crawls **permitted public sources**
*  Respects **robots.txt** & platform TOS
*  Short retention windows
*  Optional PII redaction on ingest
*  All data encrypted at rest and in transit
*  Role-based access in dashboard
*  Transparent governance
*  Ethical red-teaming evaluations

(Full ethical guidelines are detailed in the project PDF.)


---

# Admin Management

To add the first admin:

1. Sign up at `/auth`
2. Get `user_id` from DB
3. Add role:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id', 'admin');
```

---

# Roadmap

### **MVP**

* Crawler + NLP pipeline
* Hotspot map + severity scoring
* Dashboard w/ search
* Alerts (email + webhooks)

### **Next**

* WhatsApp alerts
* County boundary overlays
* Advanced explainability
* NGO partner portal

---

# Contributing

We welcome:

* AI model improvements
* Source integrations
* Dashboard UI enhancements
* Policy & ethics reviews

Submit PRs using `feature/<name>` branches.

---

# Contact

If you want to partner or test the system, reach out to the SafeGuard team or open an issue marked **“Partnership”**.

---


---
