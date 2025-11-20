import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, SeverityLevel } from '@/data/mockData';
import { AlertCircle, Clock, MapPin, ChevronRight } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

const getSeverityBadgeVariant = (severity: SeverityLevel) => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
  }
};

const getSeverityLabel = (severity: SeverityLevel) => {
  switch (severity) {
    case 'high':
      return 'ALERT - Action Required';
    case 'medium':
      return 'REVIEW - Verification Needed';
    case 'low':
      return 'INFO - Logged for Analysis';
  }
};

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  return (
    <Card className="p-6 h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-severity-high" />
            Active Alerts
          </h2>
          <p className="text-sm text-muted-foreground">Real-time threat notifications</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {alerts.length} Active
        </Badge>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 border-l-4 transition-all hover:shadow-md ${
              alert.severity === 'high'
                ? 'border-l-severity-high bg-alert-bg'
                : alert.severity === 'medium'
                ? 'border-l-severity-medium bg-warning-bg'
                : 'border-l-severity-low bg-info-bg'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                {getSeverityLabel(alert.severity)}
              </Badge>
              {alert.actionRequired && (
                <Badge variant="outline" className="text-xs bg-background">
                  Action Required
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold mb-2">{alert.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {alert.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View Details
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
