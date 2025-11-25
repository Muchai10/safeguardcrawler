import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { threatApi, AnalysisResult } from '@/services/threatApi';
import { Loader2, Search, MapPin, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getSeverityColor = (score: number) => {
  if (score <= 5) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
  if (score <= 10) return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
  if (score <= 15) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
};

const getSeverityLabel = (score: number) => {
  if (score <= 5) return 'LOW';
  if (score <= 10) return 'MEDIUM';
  if (score <= 15) return 'HIGH';
  return 'CRITICAL';
};

export const TextAnalysis = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text to analyze',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await threatApi.analyzeText(text);
      setResult(analysisResult);
      toast({
        title: 'Analysis Complete',
        description: 'Threat analysis has been completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Text Threat Analysis
        </h2>
        <p className="text-sm text-muted-foreground">Analyze text content for potential threats</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Input Text</label>
          <Textarea
            placeholder="Enter text to analyze for threats..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Threat
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Analysis Results</h3>
              <Badge className={getSeverityColor(result.severity_score)}>
                {getSeverityLabel(result.severity_score)} - Score: {result.severity_score.toFixed(2)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Sentiment</span>
                </div>
                <p className="text-lg font-semibold capitalize">{result.sentiment_analysis.sentiment}</p>
              </Card>

              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Confidence</span>
                </div>
                <p className="text-lg font-semibold">{(result.model_confidence * 100).toFixed(1)}%</p>
              </Card>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Detected Locations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.ner_locations.length > 0 ? (
                  result.ner_locations.map((location, idx) => (
                    <Badge key={idx} variant="outline">{location}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No locations detected</span>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-muted/50">
              <span className="text-sm font-medium">Emotional Boost Factor</span>
              <p className="text-lg font-semibold">{result.emotional_boost.toFixed(2)}</p>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
};
