'use client';

import useSWR from 'swr';
import { AlertTriangle, Activity, Eye, Shield } from 'lucide-react';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { HotspotMap } from '@/components/dashboard/HotspotMap';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { LiveAlertsPanel } from '@/components/dashboard/LiveAlertsPanel';

// Remove unused imports (ControlPanel & TextAnalysis were not used)
// import { ControlPanel } from '@/components/dashboard/ControlPanel';
// import { TextAnalysis } from '@/components/dashboard/TextAnalysis';

// Fixed fetcher with proper typing
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  // Fetch alerts with proper typing and fallback
  const {
    data: alerts = [],
    isLoading: alertsLoading,
    error: alertsError,
  } = useSWR<any[]>('/alerts?limit=50', fetcher, {
    refreshInterval: 8000,
    fallbackData: [], // prevents undefined during first load
  });

  // Fetch scraper status
  const {
    data: status = {},
    isLoading: statusLoading,
    error: statusError,
  } = useSWR<Record<string, number>>('/scraper-status', fetcher, {
    refreshInterval: 5000,
    fallbackData: {},
  });

  // Optional: log errors in dev
  if (alertsError) console.error('Failed to load alerts:', alertsError);
  if (statusError) console.error('Failed to load scraper status:', statusError);

  // Calculated metrics – safer and cleaner
  const highSeverityCount = alerts.filter((alert) => alert.severity === 'high').length;
  const totalIncidents = alerts.length;
  const activeAlerts = alerts.filter((alert) => alert.isActive !== false).length;
  const activeMonitoring = Object.values(status).filter((count) => count > 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-7 h-7 text-primary" />
                GBV Threat Intelligence Platform
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Unified Early-Warning System & Hotspot Mapping
              </p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                System Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Active Alerts"
            value={alertsLoading ? '...' : activeAlerts}
            icon={AlertTriangle}
            severityColor="high"
          />
          <StatsCard
            title="High Severity Incidents"
            value={alertsLoading ? '...' : highSeverityCount}
            icon={AlertTriangle}
            severityColor="high"
          />
          <StatsCard
            title="Total Incidents (24h)"
            value={alertsLoading ? '...' : totalIncidents}
            icon={Activity}
            severityColor="default"
          />
          <StatsCard
            title="Active Monitoring"
            value={statusLoading ? '...' : activeMonitoring}
            icon={Eye}
            severityColor="low"
          />
        </div>

        {/* TRENDS CHART + ALERTS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TrendsChart data={alerts} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </div>

        {/* HOTSPOT MAP + LIVE ALERTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <HotspotMap incidents={alerts} />
          </div>
          <div>
            <LiveAlertsPanel/>
          </div>
        </div>

        {/* SYSTEM INFO */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">About This System</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This dashboard represents the Unified GBV Threat Intelligence & Hotspot Early-Warning Engine.
                It combines real-time online GBV signal detection, hotspot mapping, and monitoring into one platform.
                The system uses ethical web crawling, NLP, and a multi-tier severity scoring system to deliver
                actionable intelligence across Kenya.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}