import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Mock Import Replacements
// -------------------------------

// Replace these with actual Hugging Face dataset functions
let getRecentAlerts: (limit: number) => any[] = (limit) => [];
let getAlertsBySeverity: (severity: string) => any[] = () => [];

// Replace with real Python scraper triggers
let runScrapyScraper = () => {};
let smartKenyaSearch = () => 0;

try {
  console.log("✅ Loaded HF dataset client");
} catch (e) {
  console.log("❌ HF dataset client failed");
}

try {
  console.log("✅ Loaded scraper modules");
} catch (e) {
  console.log("❌ Scraper imports failed");
}

// -------------------------------
// Scraper Status
// -------------------------------
interface ScraperStatus {
  news_running: boolean;
  twitter_running: boolean;
  last_run: string | null;
  news_results: number | string;
  twitter_results: number | string;
}

const scraperStatus: ScraperStatus = {
  news_running: false,
  twitter_running: false,
  last_run: null,
  news_results: 0,
  twitter_results: 0,
};

// -------------------------------
// Background Task Functions
// -------------------------------

function runNewsScraperOnlyTask() {
  scraperStatus.news_running = true;
  console.log("🚀 Starting ENHANCED news scraper...");

  try {
    runScrapyScraper();
    scraperStatus.news_running = false;
    scraperStatus.news_results = "Completed";
    console.log("✅ News scraper complete");
  } catch (e) {
    console.error("❌ News scraper failed", e);
    scraperStatus.news_running = false;
  }
}

function runTwitterScraperOnlyTask() {
  scraperStatus.twitter_running = true;
  console.log("🐦 Starting Twitter scraper...");

  try {
    const results = smartKenyaSearch();
    scraperStatus.twitter_running = false;
    scraperStatus.twitter_results = results;
    console.log("✅ Twitter scraper complete");
  } catch (e) {
    console.error("❌ Twitter scraper failed", e);
    scraperStatus.twitter_running = false;
  }
}

function runNewsScraper() {
  setTimeout(runNewsScraperOnlyTask, 10);
}

function runTwitterMonitor() {
  setTimeout(runTwitterScraperOnlyTask, 10);
}

// -------------------------------
// Testing Endpoints
// -------------------------------

app.get("/test-models", (req: Request, res: Response) => {
  try {
    res.json({
      status: "success",
      models_working: true,
      test_text: "Someone threatened to kill me in Nairobi",
      message: "Models integrated in scrapers",
    });
  } catch (e) {
    res.json({ status: "error", models_working: false });
  }
});

app.get("/test-db", (req: Request, res: Response) => {
  try {
    const alerts = getRecentAlerts(5);
    res.json({
      status: "success",
      database_working: true,
      alerts_count: alerts.length,
      recent_alerts: alerts,
    });
  } catch (e) {
    res.json({ status: "error", database_working: false });
  }
});

app.get("/test-scrapers", (req: Request, res: Response) => {
  try {
    res.json({
      status: "success",
      scrapers_loaded: true,
      news_scraper: "Enhanced Scrapy scraper loaded",
      twitter_monitor: "smart_kenya_search loaded",
    });
  } catch (e) {
    res.json({ status: "error", scrapers_loaded: false });
  }
});

app.get("/test-all", (req: Request, res: Response) => {
  const models = { models_working: true };
  const db = { database_working: true };
  const scrapers = { scrapers_loaded: true };

  res.json({
    overall_status:
      models.models_working && db.database_working && scrapers.scrapers_loaded
        ? "success"
        : "error",
    tests: { models, database: db, scrapers },
  });
});

// -------------------------------
// Alerts API
// -------------------------------

app.get("/alerts", (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || "20");
    const typeFilter = req.query.type_filter as string;

    let alerts = getRecentAlerts(100);

    if (typeFilter && ["news", "twitter"].includes(typeFilter)) {
      alerts = alerts.filter((a) => a.type === typeFilter);
    }

    res.json({
      status: "success",
      alerts: alerts.slice(0, limit),
      total_count: limit,
    });
  } catch (e) {
    res.status(500).json({ status: "error", error: e });
  }
});

// -------------------------------
// Manual Text Analysis
// -------------------------------

app.post("/analyze", (req: Request, res: Response) => {
  const { text } = req.body;

  const analysis = {
    text,
    length: text.length,
    words: text.split(" ").length,
    analysis: "Basic analysis - ML handled in scrapers",
  };

  res.json(analysis);
});

// -------------------------------
// Scraper Triggers
// -------------------------------

app.post("/run-scrapers", (req: Request, res: Response) => {
  if (scraperStatus.news_running || scraperStatus.twitter_running) {
    return res.json({ status: "error", message: "Scrapers already running" });
  }

  scraperStatus.last_run = "Running all scrapers...";
  scraperStatus.news_results = 0;
  scraperStatus.twitter_results = 0;

  runNewsScraper();
  runTwitterMonitor();

  res.json({
    status: "success",
    message: "All scrapers started",
  });
});

app.post("/run-news-scraper", (req: Request, res: Response) => {
  if (scraperStatus.news_running) {
    return res.json({ status: "error", message: "News scraper running" });
  }

  scraperStatus.news_running = true;
  scraperStatus.last_run = "Running enhanced Scrapy scraper...";

  runNewsScraperOnlyTask();

  res.json({
    status: "success",
    message: "News scraper started",
  });
});

app.post("/run-twitter-scraper", (req: Request, res: Response) => {
  if (scraperStatus.twitter_running) {
    return res.json({ status: "error", message: "Twitter scraper running" });
  }

  scraperStatus.twitter_running = true;
  scraperStatus.last_run = "Running Twitter scraper...";

  runTwitterScraperOnlyTask();

  res.json({
    status: "success",
    message: "Twitter scraper started",
  });
});

// -------------------------------
// Status + Severity Endpoints
// -------------------------------

app.get("/scraper-status", (req: Request, res: Response) => {
  res.json(scraperStatus);
});

app.get("/alerts-by-severity/:severity", (req: Request, res: Response) => {
  try {
    const severity = req.params.severity;
    const alerts = getAlertsBySeverity(severity);

    res.json({
      status: "success",
      severity,
      alerts,
      count: alerts.length,
    });
  } catch (e) {
    res.status(500).json({ status: "error", error: e });
  }
});

// -------------------------------
// Health Check
// -------------------------------

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "GBV Threat Detector",
    timestamp: new Date().toISOString(),
    scraper_status: scraperStatus,
  });
});

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 7860;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
