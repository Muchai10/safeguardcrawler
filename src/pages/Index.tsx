import { AlertTriangle, Activity, Eye, Shield } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { HotspotMap } from '@/components/dashboard/HotspotMap';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { DataSourcesPanel } from '@/components/dashboard/DataSourcesPanel';
import { TextAnalysis } from '@/components/dashboard/TextAnalysis';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { LiveAlertsPanel } from '@/components/dashboard/LiveAlertsPanel';
import { mockIncidents, mockAlerts, mockTrendData, mockDataSources } from '@/data/mockData';
import { useDashboardData, useScrapedArticles } from '@/hooks/useDashboardData';


const Index = () => {
  const { data: dashboardData, isLoading } = useDashboardData();
  const { data: articles } = useScrapedArticles();

  const highSeverityCount = mockIncidents.filter((i) => i.severity === 'high').length;
  const totalIncidents = dashboardData?.total_articles || 0;
  const activeAlerts = dashboardData?.gbv_count || 0;
  const activeMonitoring = Object.keys(dashboardData || {}).filter(key =>
    key.includes('.') && dashboardData?.[key] > 0
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Active Alerts"
            value={activeAlerts}
            icon={AlertTriangle}
            severityColor="high"
          />
          <StatsCard
            title="High Severity Incidents"
            value={highSeverityCount}
            icon={AlertTriangle}
            severityColor="high"
          />
          <StatsCard
            title="Total Incidents (24h)"
            value={totalIncidents}
            icon={Activity}
            severityColor="default"
          />
          <StatsCard
            title="Active Monitoring"
            value={activeMonitoring}
            icon={Eye}
            severityColor="low"
          />
        </div>

        {/* Text Analysis & Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TextAnalysis />
          </div>
          <div className="lg:col-span-1">
            <ControlPanel />
          </div>
        </div>

        {/* Live Alerts & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <HotspotMap incidents={mockIncidents} />
          </div>
          <div className="lg:col-span-1">
            <LiveAlertsPanel />
          </div>
        </div>

        {/* Mock Alerts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TrendsChart data={mockTrendData} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={mockAlerts} />
          </div>
        </div>

        {/* Data Sources Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataSourcesPanel sources={mockDataSources} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">About This System</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This dashboard represents the Unified GBV Threat Intelligence & Hotspot Early-Warning Engine.
                It combines real-time online GBV signal detection, location-based hotspot mapping, and sextortion
                monitoring into one platform. The system uses ethical web crawling, NLP processing, and a 3-tier
                severity scoring system to identify threats and provide actionable alerts to NGOs, campus security,
                and county safety offices across Kenya.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
