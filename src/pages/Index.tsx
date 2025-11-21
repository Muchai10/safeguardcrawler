import { AlertTriangle, Activity, Eye, Shield, LogOut, UserCircle, Settings } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { HotspotMap } from '@/components/dashboard/HotspotMap';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { DataSourcesPanel } from '@/components/dashboard/DataSourcesPanel';
import { mockIncidents, mockAlerts, mockTrendData, mockDataSources } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const Index = () => {
  const { user, logout } = useAuth();
  const highSeverityCount = mockIncidents.filter((i) => i.severity === 'high').length;
  const mediumSeverityCount = mockIncidents.filter((i) => i.severity === 'medium').length;
  const totalIncidents = mockIncidents.length;
  const activeAlerts = mockAlerts.filter((a) => a.actionRequired).length;

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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  System Active
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserCircle className="w-4 h-4" />
                    {user?.name || 'User'}
                    <Badge variant="secondary" className="ml-1">{user?.role}</Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            value={mockDataSources.filter((s) => s.status === 'active').length}
            icon={Eye}
            severityColor="low"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <HotspotMap incidents={mockIncidents} />
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertsPanel alerts={mockAlerts} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <TrendsChart data={mockTrendData} />
          </div>

          {/* Data Sources Panel */}
          <div className="lg:col-span-1">
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
