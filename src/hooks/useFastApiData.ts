'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

// Put your deployed FastAPI URL here
const API_BASE = 'https://your-fastapi-backend.com';

// Fetch alerts from FastAPI
export const useAlerts = (limit: number = 50) => {
  return useQuery(['alerts', limit], async () => {
    const res = await fetch(`${API_BASE}/test-db`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    const data = await res.json();
    return (data.recent_alerts || []).map((a: any) => ({
      id: a.id,
      title: a.article_title,
      content: a.content,
      source: a.source_site,
      severity_tier: a.severity_tier?.toUpperCase() || 'LOW',
      threat_level: a.threat_level,
      locations: a.locations || [], // must contain {lat, lng, name}
      created_at: a.created_at,
      isActive: true,
    }));
  }, {
    refetchInterval: 5000,
  });
};

// Fetch scraper status from FastAPI
export const useScraperStatus = () => {
  return useQuery(['scraperStatus'], async () => {
    const res = await fetch(`${API_BASE}/scraper-status`);
    if (!res.ok) throw new Error('Failed to fetch scraper status');
    return res.json();
  }, {
    refetchInterval: 2000,
  });
};

// Mutation to run scrapers
export const useRunScraper = () => {
  return useMutation(async (endpoint: string) => {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST' });
    if (!res.ok) throw new Error('Scraper failed');
    return res.json();
  });
};
