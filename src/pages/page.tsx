'use client';

import { StatsCard, ControlPanel, HotspotMap, TrendsChart, LiveAlertsPanel } from '@/components/DashboardComponents';
import { useAlerts, useScraperStatus } from '@/hooks/useFastApiData';
import { AlertTriangle, Activity, Eye, Shield } from 'lucide-react';

export default function Page() {
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts();
  const { data: status = {}, isLoading: statusLoading } = useScraperStatus();

  const highSeverityCount = alerts.filter(a => a.severity_tier === 'HIGH').length;
  const totalIncidents = alerts.length;
  const activeAlerts = alerts.filter(a => a.isActive)?.length || totalIncidents;
  const activeMonitoring = Object.values(status).filter(val => val === true || val > 0).length;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <header className="border-b border-border bg-card p-4 mb-6 rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> GBV Threat Intelligence Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Unified Early-Warning & Hotspot Mapping</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">System Active</span>
        </div>
      </header>

      {/* Control Panel */}
      <ControlPanel />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Active Alerts" value={alertsLoading ? '...' : activeAlerts} icon={AlertTriangle} severityColor="high" />
        <StatsCard title="High Severity Incidents" value={alertsLoading ? '...' : highSeverityCount} icon={AlertTriangle} severityColor="high" />
        <StatsCard title="Total Incidents (24h)" value={alertsLoading ? '...' : totalIncidents} icon={Activity} />
        <StatsCard title="Active Monitoring" value={statusLoading ? '...' : activeMonitoring} icon={Eye} severityColor="low" />
      </div>

      {/* Hotspot Map & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <HotspotMap incidents={alerts} />
          <TrendsChart data={alerts} />
        </div>
        <div className="lg:col-span-1">
          <LiveAlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
