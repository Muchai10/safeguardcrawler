#!/usr/bin/env python3
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from news_scraper import EnhancedGBVCrawler

if __name__ == "__main__":
    print("🚀 Starting News Scraper...")
    process = CrawlerProcess(get_project_settings())
    process.crawl(EnhancedGBVCrawler)
    process.start()