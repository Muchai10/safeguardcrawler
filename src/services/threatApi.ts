const BASE_URL = 'https://iamparody-safe-guard-crawler.hf.space';

export interface AnalysisResult {
  severity_score: number;
  sentiment_analysis: {
    sentiment: string;
  };
  ner_locations: string[];
  model_confidence: number;
  emotional_boost: number;
}

export interface ThreatAlert {
  id: string;
  title: string;
  threat_level: number;
  locations: string[];
  severity_tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  description?: string;
}

export interface ScraperStatus {
  status: string;
  active_scrapers?: number;
  last_run?: string;
}

export const threatApi = {
  async analyzeText(text: string): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('text', text);
    
    const response = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    return response.json();
  },

  async runScrapers(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${BASE_URL}/run-scrapers`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to start scrapers');
    }
    
    return response.json();
  },

  async getScraperStatus(): Promise<ScraperStatus> {
    const response = await fetch(`${BASE_URL}/scraper-status`);
    
    if (!response.ok) {
      throw new Error('Failed to get scraper status');
    }
    
    return response.json();
  },

  async addTestAlert(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${BASE_URL}/add-test-alert`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to add test alert');
    }
    
    return response.json();
  },

  async getRecentAlerts(): Promise<ThreatAlert[]> {
    const response = await fetch(`${BASE_URL}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    
    return response.json();
  },
};
