import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataSource } from '@/data/mockData';
import { Activity, Database, Globe, MessageSquare, AlertTriangle } from 'lucide-react';

interface DataSourcesPanelProps {
  sources: DataSource[];
}

const getSourceIcon = (type: DataSource['type']) => {
  switch (type) {
    case 'social':
      return MessageSquare;
    case 'news':
      return Globe;
    case 'forum':
      return MessageSquare;
    case 'website':
      return Database;
  }
};

export const DataSourcesPanel = ({ sources }: DataSourcesPanelProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Sources
          </h2>
          <p className="text-sm text-muted-foreground">Active crawlers and collectors</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {sources.filter((s) => s.status === 'active').length} Active
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {sources.map((source, index) => {
          const Icon = getSourceIcon(source.type);
          const statusColor =
            source.status === 'active'
              ? 'bg-green-500'
              : source.status === 'inactive'
              ? 'bg-gray-400'
              : 'bg-red-500';

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {source.name}
                    <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last crawl: {source.lastCrawl}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {source.status === 'error' ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">{source.itemsCollected}</p>
                    <p className="text-xs text-muted-foreground">items</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
