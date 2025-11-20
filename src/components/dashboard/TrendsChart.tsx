import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData } from '@/data/mockData';
import { TrendingUp } from 'lucide-react';

interface TrendsChartProps {
  data: TrendData[];
}

export const TrendsChart = ({ data }: TrendsChartProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Incident Trends
          </h2>
          <p className="text-sm text-muted-foreground">7-day severity breakdown</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="hsl(var(--severity-high))" 
            strokeWidth={2}
            name="High Severity"
            dot={{ fill: 'hsl(var(--severity-high))' }}
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            stroke="hsl(var(--severity-medium))" 
            strokeWidth={2}
            name="Medium Severity"
            dot={{ fill: 'hsl(var(--severity-medium))' }}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="hsl(var(--severity-low))" 
            strokeWidth={2}
            name="Low Severity"
            dot={{ fill: 'hsl(var(--severity-low))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
