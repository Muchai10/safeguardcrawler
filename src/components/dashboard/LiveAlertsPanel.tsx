import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { threatApi, ThreatAlert } from '@/services/threatApi';
import { AlertCircle, MapPin, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getSeverityColor = (tier: string) => {
  switch (tier) {
    case 'CRITICAL':
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    case 'HIGH':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    case 'MEDIUM':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
    case 'LOW':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    default:
      return 'bg-muted';
  }
};

const getBorderColor = (tier: string) => {
  switch (tier) {
    case 'CRITICAL':
      return 'border-l-red-500';
    case 'HIGH':
      return 'border-l-orange-500';
    case 'MEDIUM':
      return 'border-l-yellow-500';
    case 'LOW':
      return 'border-l-green-500';
    default:
      return 'border-l-border';
  }
};

export const LiveAlertsPanel = () => {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await threatApi.getRecentAlerts();
      setAlerts(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Live Threat Alerts
          </h2>
          <p className="text-sm text-muted-foreground">Real-time threat monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {alerts.length} Alerts
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {alerts.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No alerts at this time</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 border-l-4 transition-all hover:shadow-md ${getBorderColor(alert.severity_tier)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge className={getSeverityColor(alert.severity_tier)}>
                  {alert.severity_tier}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Level {alert.threat_level}
                </Badge>
              </div>

              <h3 className="font-semibold mb-2">{alert.title}</h3>
              {alert.description && (
                <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {alert.locations.join(', ') || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};
