import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Shield, Coins, Smile, CalendarDays, Loader2 } from 'lucide-react';
import { callAI } from '@/lib/deepseek';
import type { RiskResult, TransportMode } from '@/lib/risk-scoring';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  riskResult: RiskResult;
  transportMode: TransportMode;
  origin: string;
  destination: string;
  departureTime: string;
}

export function AIAdvisor({ riskResult, transportMode, origin, destination, departureTime }: AIAdvisorProps) {
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const context = `Route: ${origin} → ${destination}. Mode: ${transportMode}. Time: ${departureTime}. Risk: ${riskResult.score}/100 (${riskResult.label}). Delay: ${riskResult.delayMinutes} min. Weather: Partly cloudy, 28°C.`;

  const generateBriefing = async () => {
    setLoading(true);
    setActiveAction(null);
    const res = await callAI({ prompt: `Give a 3-sentence personalized commute briefing for this commuter. Reference their specific mode, time, risk level, estimated delay, and current weather conditions. Be direct and actionable.`, context });
    setBriefing(res.response);
    setLoading(false);
  };

  const quickActions = [
    { id: 'safety', label: 'Safety', prompt: 'Give 3 specific safety tips for this commute considering the risk level and transport mode.' },
    { id: 'cost', label: 'Cost', prompt: 'Suggest 3 ways to save money on this specific commute route and transport mode.' },
    { id: 'stress', label: 'Stress', prompt: 'Give 3 stress-reduction tips for this commute considering the delay and risk level.' },
    { id: 'weekly', label: 'Weekly', prompt: 'Create a brief weekly commute plan optimizing for this route, suggesting best times each day.' },
  ];

  const handleAction = async (action: typeof quickActions[0]) => {
    setActiveAction(action.id);
    setLoading(true);
    const res = await callAI({ prompt: action.prompt, context });
    setBriefing(res.response);
    setLoading(false);
  };

  return (
    <Card className="border-commute-border shadow-commute">
      <CardContent className="p-6 md:p-8 space-y-5">
        <Button onClick={generateBriefing} disabled={loading} variant="outline" className="w-full h-11 text-sm tracking-wide">
          {loading && !activeAction ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Briefing
        </Button>

        <div className="grid grid-cols-4 gap-2">
          {quickActions.map(action => (
            <Button
              key={action.id}
              variant={activeAction === action.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={loading}
              className="text-xs uppercase tracking-widest h-10"
            >
              {action.label}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {briefing && !loading && (
          <div className="rounded-lg bg-accent/50 p-5 text-sm prose prose-sm max-w-none">
            <ReactMarkdown>{briefing}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
