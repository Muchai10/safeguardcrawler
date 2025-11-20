import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  severityColor?: 'high' | 'medium' | 'low' | 'default';
}

export const StatsCard = ({ title, value, icon: Icon, trend, severityColor = 'default' }: StatsCardProps) => {
  const colorClasses = {
    high: 'text-severity-high',
    medium: 'text-severity-medium',
    low: 'text-severity-low',
    default: 'text-primary',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${colorClasses[severityColor]}`}>{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${
          severityColor === 'high' ? 'from-severity-high/10 to-severity-high/20' :
          severityColor === 'medium' ? 'from-severity-medium/10 to-severity-medium/20' :
          severityColor === 'low' ? 'from-severity-low/10 to-severity-low/20' :
          'from-primary/10 to-primary/20'
        }`}>
          <Icon className={`w-6 h-6 ${colorClasses[severityColor]}`} />
        </div>
      </div>
    </Card>
  );
};
