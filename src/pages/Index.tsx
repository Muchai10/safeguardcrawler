import { useEffect, useState } from "react";
import { AlertTriangle, Activity, Eye, Shield, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HotspotMap } from "@/components/dashboard/HotspotMap";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { TrendsChart } from "@/components/dashboard/TrendsChart";
import { DataSourcesPanel } from "@/components/dashboard/DataSourcesPanel";
import { TextAnalysis } from "@/components/dashboard/TextAnalysis";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { LiveAlertsPanel } from "@/components/dashboard/LiveAlertsPanel";
import { mockIncidents, mockTrendData, mockDataSources } from "@/data/mockData";
import { useDashboardData } from "@/hooks/useDashboardData";

const API_BASE = "https://crawlersco-safeguardcrawler.hf.space";

interface Alert {
  id: number;
  title: string;
  content: string;
  threat_level: number;
}

const Index = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch(`${API_BASE}/alerts?limit=10`);
      const data = await res.json();
      setLiveAlerts(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const runScraper = async () => {
    try {
      await fetch(`${API_BASE}/run-news-scraper`, { method: "POST" });
      alert("Scraper started!");
    } catch (error) {
      console.error("Error running scraper:", error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAlerts(); // initial fetch
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const highSeverityCount = liveAlerts.filter((i) => i.threat_level === 3).length;
  const totalIncidents = dashboardData?.total_articles || 0;
  const activeAlerts = dashboardData?.gbv_count || 0;
  const activeMonitoring = Object.keys(dashboardData || {}).filter((key) =>
    key.includes(".") && dashboardData?.[key] > 0
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
            trend={{ value: '12% from yesterday', isPositive: false }}
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
            trend={{ value: '8% from yesterday', isPositive: true }}
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Live Alerts</h2>
              <div className="flex items-center gap-2">
                <button
                  className={`flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition`}
                  onClick={fetchAlerts}
                  disabled={loadingAlerts}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAlerts ? 'animate-spin' : ''}`} />
                  {loadingAlerts ? "Refreshing..." : "Refresh Now"}
                </button>
                {lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated}
                  </span>
                )}
              </div>
            </div>
            <LiveAlertsPanel alerts={liveAlerts} />
          </div>
        </div>

        {/* Trends & Alerts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <TrendsChart data={mockTrendData} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={liveAlerts} />
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
