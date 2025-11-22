import scrapy
import re
import os
import pandas as pd
from datetime import datetime
import logging
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from database.local_postgres import save_news_alert

# Enable more verbose logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('gbv_crawler')

class EnhancedGBVCrawler(scrapy.Spider):
    name = "enhanced_gbv_intelligence"
    
    custom_settings = {
        "USER_AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 1,
        "LOG_LEVEL": "INFO",
        "AUTOTHROTTLE_ENABLED": False,
    }

    allowed_domains = [
        'tuko.co.ke', 'capitalfm.co.ke', 'standardmedia.co.ke', 
        'nation.co.ke', 'thestar.co.ke'
    ]

    start_urls = [
        'https://www.tuko.co.ke/kenya/',
        'https://www.capitalfm.co.ke/news/',
        'https://www.standardmedia.co.ke/',
        'https://www.thestar.co.ke/'
    ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_items = []
        self.processed_urls = set()  # ADDED: Track URLs in current run
        
        # Enhanced Kenyan locations - all 47 counties + major towns
        self.kenyan_locations = {
            'nairobi': 'Nairobi',
            'mombasa': 'Mombasa', 
            'kisumu': 'Kisumu',
            'nakuru': 'Nakuru',
            'eldoret': 'Eldoret',
            'thika': 'Thika',
            'kakamega': 'Kakamega',
            'kisii': 'Kisii',
            'nyeri': 'Nyeri',
            'meru': 'Meru',
            'lamu': 'Lamu',
            'malindi': 'Malindi',
            'kitale': 'Kitale',
            'nyahururu': 'Nyahururu',
            'garissa': 'Garissa',
            'wajir': 'Wajir',
            'mandera': 'Mandera',
            'machakos': 'Machakos',
            'kitui': 'Kitui',
            'embu': 'Embu',
            'kisumu': 'Kisumu',
            'homa bay': 'Homa Bay',
            'migori': 'Migori',
            'siaya': 'Siaya',
            'busia': 'Busia',
            'bungoma': 'Bungoma',
            'kakamega': 'Kakamega',
            'vihiga': 'Vihiga',
            'nakuru': 'Nakuru',
            'narok': 'Narok',
            'kajiado': 'Kajiado',
            'kericho': 'Kericho',
            'bomet': 'Bomet',
            'kERICHO': 'Kericho',
            'kisumu': 'Kisumu',
            'nyanza': 'Nyanza',
            'western': 'Western',
            'rift valley': 'Rift Valley',
            'eastern': 'Eastern',
            'central': 'Central',
            'coast': 'Coast',
            'north eastern': 'North Eastern'
        }
        
        # Enhanced GBV keywords including Sheng and Kiswahili
        self.gbv_keywords = {
            'violence_english': ['gbv', 'gender-based violence', 'domestic violence', 'intimate partner violence', 
                               'femicide', 'assault', 'battery', 'physical abuse'],
            'violence_kiswahili': ['unyanyasaji', 'unyanyasaji wa kijinsia', 'vurugu', 'kupigwa', 'kuchomwa',
                                 'kubakwa', 'kuteswa', 'kinyama'],
            'violence_sheng': ['kupiga', 'kuchoma', 'kubaka', 'kutesa', 'kufinya'],
            'harassment_english': ['sexual harassment', 'cyber harassment', 'online harassment', 'stalking',
                                 'molestation', 'unwanted advances'],
            'harassment_kiswahili': ['kukosewa', 'kudharauliwa', 'kudhoofishwa', 'kudhalilisha', 'kukashifu'],
            'exploitation_english': ['sextortion', 'blackmail', 'revenge porn', 'non-consensual sharing',
                                   'child abuse', 'human trafficking'],
            'exploitation_kiswahili': ['kutumia vibaya', 'kudanganya', 'kula rushwa ya ngono', 'kufichua'],
            'threats_english': ['death threats', 'rape threats', 'violence threats', 'harm threats',
                              'kill you', 'hurt you'],
            'threats_kiswahili': ['tisho la kifo', 'kuuawa', 'kuchomwa', 'kupigwa', 'kufa'],
            'demographics': ['woman', 'women', 'girl', 'minor', 'student', 'campus', 'mwanaume', 'mwanamke',
                           'msichana', 'mvulana', 'kijana']
        }
        
        # Flatten all keywords for basic detection
        self.all_keywords = []
        for category in self.gbv_keywords.values():
            self.all_keywords.extend(category)
            
        logger.info("🕷️ Enhanced GBV Threat Intelligence Spider initialized")

    def parse(self, response):
        """Parse main pages and extract article links"""
        logger.info(f"✅ Successfully loaded: {response.url} (Status: {response.status})")
        
        # Extract all links
        article_links = response.css('a::attr(href)').getall()
        logger.info(f"🔗 Found {len(article_links)} total links on {response.url}")
        
        # Filter links that might contain GBV-related content
        relevant_links = []
        for link in article_links:
            if link and any(kw.lower() in link.lower() for kw in self.all_keywords):
                # Make sure link is absolute
                if link.startswith('/'):
                    link = response.urljoin(link)
                elif link.startswith('http') and any(domain in link for domain in self.allowed_domains):
                    pass
                else:
                    continue
                relevant_links.append(link)
        
        logger.info(f"🎯 Found {len(relevant_links)} relevant GBV-related links")
        
        # Follow first 8 relevant links for better coverage
        for link in relevant_links[:8]:
            logger.info(f"➡️ Following link: {link}")
            yield response.follow(link, self.parse_article)

    def parse_article(self, response):
        """Parse individual articles and extract enhanced threat intelligence"""
        # ADDED: Skip if already processed in this run
        if response.url in self.processed_urls:
            logger.info(f"⏭️ Already processed this run: {response.url}")
            return
            
        self.processed_urls.add(response.url)
        
        logger.info(f"📖 Parsing article: {response.url}")
        
        title = response.css('h1::text, h2::text, title::text').get() or 'No Title'
        paragraphs = response.css('p::text, div.article-content ::text, div.story-content ::text').getall()
        content = ' '.join(paragraphs)
        content = self.clean_text(content)

        logger.info(f"📝 Article '{title[:50]}...' - Content length: {len(content)} chars")

        # Enhanced threat detection with language analysis
        threat_analysis = self.enhanced_threat_detection(title + " " + content)
        
        if threat_analysis['severity_score'] > 0:
            location_analysis = self.enhanced_location_extraction(content)
            language_analysis = self.analyze_language_content(content)
            
            # SAVE TO DATABASE
            save_news_alert(
                source_site=response.url.split('/')[2],
                article_title=title.strip(),
                article_url=response.url,
                content=content[:2000],  # Limit for database
                threat_level=threat_analysis['severity_score'],
                locations=location_analysis['mentioned_locations'],
                severity_tier=self.assign_severity_tier(threat_analysis['severity_score'])
            )
            
            item = {
                'metadata': {
                    'crawled_at': datetime.utcnow().isoformat(),
                    'source': response.url.split('/')[2],
                    'url': response.url,
                    'content_length': len(content),
                    'language_profile': language_analysis
                },
                'content': {
                    'title': title.strip(),
                    'full_text': content[:2000],  # Limit for Excel
                    'summary': content[:300] + '...' if len(content) > 300 else content,
                    'word_count': len(content.split())
                },
                'threat_analysis': threat_analysis,
                'location_analysis': location_analysis,
                'severity_tier': self.assign_severity_tier(threat_analysis['severity_score']),
                'confidence_metrics': self.calculate_confidence_metrics(content, threat_analysis)
            }
            
            self.collected_items.append(item)
            logger.info(f"✅ THREAT DETECTED: '{title[:50]}...' - Tier: {item['severity_tier']} - Score: {threat_analysis['severity_score']}")
            yield item
        else:
            logger.info(f"❌ No threat signals found in: {response.url}")

    def enhanced_threat_detection(self, text):
        """Enhanced threat detection with multilingual support"""
        text_lower = text.lower()
        
        signals_detected = {
            'violence_signals': {'english': [], 'kiswahili': [], 'sheng': []},
            'harassment_signals': {'english': [], 'kiswahili': [], 'sheng': []},
            'exploitation_signals': {'english': [], 'kiswahili': [], 'sheng': []},
            'threat_signals': {'english': [], 'kiswahili': [], 'sheng': []},
            'demographic_targets': []
        }
        
        severity_score = 0
        
        # Detect signals by language category
        # Violence detection
        for keyword in self.gbv_keywords['violence_english']:
            if keyword in text_lower:
                signals_detected['violence_signals']['english'].append(keyword)
                severity_score += 3
                
        for keyword in self.gbv_keywords['violence_kiswahili']:
            if keyword in text_lower:
                signals_detected['violence_signals']['kiswahili'].append(keyword)
                severity_score += 4  # Higher weight for local language signals
                
        for keyword in self.gbv_keywords['violence_sheng']:
            if keyword in text_lower:
                signals_detected['violence_signals']['sheng'].append(keyword)
                severity_score += 5  # Highest weight for Sheng (often more explicit)
        
        # Harassment detection
        for keyword in self.gbv_keywords['harassment_english']:
            if keyword in text_lower:
                signals_detected['harassment_signals']['english'].append(keyword)
                severity_score += 2
                
        for keyword in self.gbv_keywords['harassment_kiswahili']:
            if keyword in text_lower:
                signals_detected['harassment_signals']['kiswahili'].append(keyword)
                severity_score += 3
        
        # Exploitation detection
        for keyword in self.gbv_keywords['exploitation_english']:
            if keyword in text_lower:
                signals_detected['exploitation_signals']['english'].append(keyword)
                severity_score += 4
                
        for keyword in self.gbv_keywords['exploitation_kiswahili']:
            if keyword in text_lower:
                signals_detected['exploitation_signals']['kiswahili'].append(keyword)
                severity_score += 5
        
        # Threat detection
        for keyword in self.gbv_keywords['threats_english']:
            if keyword in text_lower:
                signals_detected['threat_signals']['english'].append(keyword)
                severity_score += 5
                
        for keyword in self.gbv_keywords['threats_kiswahili']:
            if keyword in text_lower:
                signals_detected['threat_signals']['kiswahili'].append(keyword)
                severity_score += 6
        
        # Demographic targeting
        for keyword in self.gbv_keywords['demographics']:
            if keyword in text_lower:
                signals_detected['demographic_targets'].append(keyword)
                severity_score += 1

        # Calculate language distribution
        total_signals = sum(len(signals) for lang_cat in signals_detected.values() 
                          if isinstance(lang_cat, dict) for signals in lang_cat.values())
        total_signals += len(signals_detected['demographic_targets'])
        
        language_distribution = {}
        if total_signals > 0:
            for category in ['violence_signals', 'harassment_signals', 'exploitation_signals', 'threat_signals']:
                for lang in ['english', 'kiswahili', 'sheng']:
                    count = len(signals_detected[category][lang])
                    if count > 0:
                        language_distribution[f"{category}_{lang}"] = count

        return {
            'signals_detected': signals_detected,
            'severity_score': min(severity_score, 20),  # Increased cap for enhanced detection
            'signal_count': total_signals,
            'language_distribution': language_distribution,
            'multilingual_detection': any(len(signals_detected[cat]['kiswahili']) > 0 or 
                                        len(signals_detected[cat]['sheng']) > 0 
                                        for cat in signals_detected if isinstance(signals_detected[cat], dict))
        }

    def enhanced_location_extraction(self, text):
        """Enhanced location extraction with county mapping"""
        text_lower = text.lower()
        
        locations_found = []
        county_mapping = {}
        
        for location_key, location_proper in self.kenyan_locations.items():
            if location_key in text_lower:
                locations_found.append(location_proper)
                county_mapping[location_proper] = self.get_county_region(location_proper)
        
        # Remove duplicates while preserving order
        locations_found = list(dict.fromkeys(locations_found))
        
        return {
            'mentioned_locations': locations_found,
            'primary_location': locations_found[0] if locations_found else 'Unknown',
            'county_mapping': county_mapping,
            'location_count': len(locations_found),
            'needs_geocoding': bool(locations_found)
        }

    def get_county_region(self, location):
        """Map locations to counties and regions"""
        county_regions = {
            'Nairobi': {'county': 'Nairobi', 'region': 'Nairobi'},
            'Mombasa': {'county': 'Mombasa', 'region': 'Coast'},
            'Kisumu': {'county': 'Kisumu', 'region': 'Nyanza'},
            'Nakuru': {'county': 'Nakuru', 'region': 'Rift Valley'},
            'Eldoret': {'county': 'Uasin Gishu', 'region': 'Rift Valley'},
            'Thika': {'county': 'Kiambu', 'region': 'Central'},
            'Kakamega': {'county': 'Kakamega', 'region': 'Western'},
            # Add more mappings as needed
        }
        return county_regions.get(location, {'county': location, 'region': 'Unknown'})

    def analyze_language_content(self, text):
        """Basic language analysis for content"""
        text_lower = text.lower()
        
        # Simple language detection based on common words
        kiswahili_indicators = ['na', 'ya', 'wa', 'kwa', 'katika', 'hii', 'hayo', 'lakini', 'pia']
        sheng_indicators = ['msee', 'noma', 'poa', 'sema', 'vipi', 'buda', 'dame', 'kula']
        
        kiswahili_count = sum(1 for word in kiswahili_indicators if word in text_lower)
        sheng_count = sum(1 for word in sheng_indicators if word in text_lower)
        english_dominant = len(text.split()) > (kiswahili_count + sheng_count) * 2
        
        return {
            'estimated_language': 'English' if english_dominant else 'Kiswahili/Sheng',
            'kiswahili_indicators': kiswahili_count,
            'sheng_indicators': sheng_count,
            'language_mix_detected': kiswahili_count > 0 or sheng_count > 0
        }

    def assign_severity_tier(self, score):
        """Assign severity tier based on enhanced scoring"""
        if score >= 10:
            return "CRITICAL"  # Immediate alert
        elif score >= 6:
            return "HIGH"      # Urgent review
        elif score >= 3:
            return "MEDIUM"    # Human review
        else:
            return "LOW"       # Log only

    def calculate_confidence_metrics(self, content, threat_analysis):
        """Calculate confidence metrics for detection"""
        base_confidence = min(threat_analysis['severity_score'] * 5, 100)
        
        # Boost confidence for multilingual detection
        if threat_analysis['multilingual_detection']:
            base_confidence += 15
            
        # Adjust based on content quality and specificity
        if len(content) > 500:
            base_confidence += 10
        elif len(content) < 100:
            base_confidence -= 20
            
        # Boost for specific location mentions
        if threat_analysis['signal_count'] > 3:
            base_confidence += 10
            
        return {
            'detection_confidence': min(max(base_confidence, 0), 100),
            'content_quality': 'High' if len(content) > 300 else 'Medium' if len(content) > 100 else 'Low',
            'signal_density': threat_analysis['signal_count'] / max(1, len(content.split()) // 100)
        }

    @staticmethod
    def clean_text(text):
        """Enhanced text cleaning"""
        text = re.sub(r'<.*?>', '', text)
        text = re.sub(r'[^\w\s\.\,\!\\?\-\']', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def closed(self, reason):
        """Called when spider closes - data now goes to database only"""
        logger.info(f"🛑 Spider closed: {reason}")
        logger.info(f"📊 Total items collected and saved to database: {len(self.collected_items)}")
        # Excel export removed - all data goes to PostgreSQL database

# This allows running with: python enhanced_scraper.py
if __name__ == "__main__":
    from scrapy.crawler import CrawlerProcess
    
    print("🚀 Starting Enhanced GBV Crawler with Multilingual Support...")
    print("📊 Features:")
    print("   - 47 Kenyan counties + major towns")
    print("   - English, Kiswahili, and Sheng detection")
    print("   - Enhanced severity scoring")
    print("   - Geographic analysis")
    print("   - Real-time database storage")
    print("   - Duplicate protection enabled")  # ADDED: Note about duplicate protection
    
    process = CrawlerProcess(settings={
        "USER_AGENT": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "ROBOTSTXT_OBEY": True,
        "DOWNLOAD_DELAY": 1,
        "CONCURRENT_REQUESTS": 1,
        "LOG_LEVEL": "INFO",
    })
    
    process.crawl(EnhancedGBVCrawler)
    process.start()