import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { threatApi, ScraperStatus } from '@/services/threatApi';
import { Play, Database, Activity, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ControlPanel = () => {
  const [isRunningScrapers, setIsRunningScrapers] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const statusData = await threatApi.getScraperStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRunScrapers = async () => {
    setIsRunningScrapers(true);
    try {
      const result = await threatApi.runScrapers();
      toast({
        title: 'Scrapers Started',
        description: result.message || 'Background scrapers are now running',
      });
      fetchStatus();
    } catch (error) {
      toast({
        title: 'Failed to Start Scrapers',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRunningScrapers(false);
    }
  };

  const handleAddTestAlert = async () => {
    setIsAddingTest(true);
    try {
      const result = await threatApi.addTestAlert();
      toast({
        title: 'Test Alert Added',
        description: result.message || 'Sample data has been added to the system',
      });
    } catch (error) {
      toast({
        title: 'Failed to Add Test Alert',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAddingTest(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          System Control Panel
        </h2>
        <p className="text-sm text-muted-foreground">Manage data collection and testing</p>
      </div>

      <div className="space-y-4">
        {status && (
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Scraper Status</span>
              <Badge variant={status.status === 'active' ? 'default' : 'secondary'}>
                {status.status}
              </Badge>
            </div>
            {status.active_scrapers !== undefined && (
              <p className="text-xs text-muted-foreground mt-2">
                Active Scrapers: {status.active_scrapers}
              </p>
            )}
            {status.last_run && (
              <p className="text-xs text-muted-foreground">
                Last Run: {new Date(status.last_run).toLocaleString()}
              </p>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleRunScrapers}
            disabled={isRunningScrapers}
            className="w-full"
          >
            {isRunningScrapers ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Scrapers...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Scrapers
              </>
            )}
          </Button>

          <Button
            onClick={handleAddTestAlert}
            disabled={isAddingTest}
            variant="outline"
            className="w-full"
          >
            {isAddingTest ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding Sample...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Add Sample Data
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
