import { Shield, AlertTriangle, Activity, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ScraperStatusPanel } from '@/components/dashboard/ScraperStatusPanel';
import { DataSummaryCard } from '@/components/dashboard/DataSummaryCard';
import { ConnectionStatus } from '@/components/dashboard/ConnectionStatus';
import { useAlerts, useScraperStatus } from '@/hooks/useHuggingFaceData';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const queryClient = useQueryClient();
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts(50);
  const { data: status, isLoading: statusLoading } = useScraperStatus();

  const highSeverity = alerts.filter(a => a.severity === 'high').length;
  const mediumSeverity = alerts.filter(a => a.severity === 'medium').length;
  const totalAlerts = alerts.length;

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['hf-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['hf-scraper-status'] });
  };

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
                Real-time data from HuggingFace Space API
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefreshAll}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        {/* Connection Status */}
        <div className="mb-6">
          <ConnectionStatus />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Alerts"
            value={alertsLoading ? '...' : totalAlerts}
            icon={AlertTriangle}
            severityColor="default"
            trend={{ value: 'From HuggingFace API', isPositive: true }}
          />
          <StatsCard
            title="High Severity"
            value={alertsLoading ? '...' : highSeverity}
            icon={AlertTriangle}
            severityColor="high"
          />
          <StatsCard
            title="Medium Severity"
            value={alertsLoading ? '...' : mediumSeverity}
            icon={Activity}
            severityColor="medium"
          />
          <StatsCard
            title="Articles Scraped"
            value={statusLoading ? '...' : (status?.articlesScraped || 0)}
            icon={Eye}
            severityColor="low"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Alerts Panel - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AlertsPanel />
          </div>

          {/* Side panels */}
          <div className="space-y-6">
            <ScraperStatusPanel />
            <DataSummaryCard />
          </div>
        </div>

        {/* API Info Footer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">API Connection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connected to: <code className="bg-muted px-1 py-0.5 rounded">https://crawlersco-safeguardcrawler.hf.space</code>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Endpoints: /alerts, /scraper-status, /run-news-scraper
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
