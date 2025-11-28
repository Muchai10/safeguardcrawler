// src/hooks/useHuggingFaceData.ts
import { useQuery } from '@tanstack/react-query';

const HF_API_URL = process.env.NEXT_PUBLIC_HF_API_URL;
const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;

// Fetch alerts from Hugging Face
const fetchAlerts = async (limit: number = 50) => {
  if (!HF_API_URL || !HF_API_KEY) throw new Error('Hugging Face API URL or key not set');

  const res = await fetch(`${HF_API_URL}/alerts?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  }

  const data = await res.json();
  return data; // should be array of alerts
};

export const useAlerts = (limit: number = 50) => {
  return useQuery(['hf-alerts', limit], () => fetchAlerts(limit), {
    refetchInterval: 60000, // auto-refresh every 60s
    staleTime: 30000,        // 30s stale time
  });
};

// Fetch scraper status
const fetchScraperStatus = async () => {
  if (!HF_API_URL || !HF_API_KEY) throw new Error('Hugging Face API URL or key not set');

  const res = await fetch(`${HF_API_URL}/scraper-status`, {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch scraper status: ${res.statusText}`);
  }

  return res.json(); // should return object with scraper stats
};

export const useScraperStatus = () => {
  return useQuery(['hf-scraper-status'], fetchScraperStatus, {
    refetchInterval: 60000, // auto-refresh every 60s
    staleTime: 30000,
  });
};
