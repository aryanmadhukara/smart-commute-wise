import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { TransportMode } from '@/lib/risk-scoring';

interface HistoryEntry {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  transport_mode: string;
  day_of_week: string;
  risk_score: number;
  risk_label: string;
  delay_minutes: number;
  created_at: string;
}

interface CommuteHistoryProps {
  onReload: (entry: {
    origin: string;
    destination: string;
    departureTime: string;
    transportMode: TransportMode;
    dayOfWeek: string;
  }) => void;
  refreshTrigger: number;
}

export function CommuteHistory({ onReload, refreshTrigger }: CommuteHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('commute_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    setHistory((data as HistoryEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [refreshTrigger]);

  const clearHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: items } = await supabase.from('commute_history').select('id');
    if (items) {
      for (const item of items) {
        await supabase.from('commute_history').delete().eq('id', item.id);
      }
    }
    setHistory([]);
  };

  const riskColor = (label: string) => label === 'high' ? '#ef4444' : label === 'moderate' ? '#f59e0b' : '#22c55e';

  if (history.length === 0 && !loading) return null;

  return (
    <Card className="border-commute-border shadow-commute">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Recent Commutes</p>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground h-8">
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {history.map(entry => (
            <button
              key={entry.id}
              onClick={() => onReload({
                origin: entry.origin,
                destination: entry.destination,
                departureTime: entry.departure_time,
                transportMode: entry.transport_mode as TransportMode,
                dayOfWeek: entry.day_of_week,
              })}
              className="w-full flex items-center justify-between rounded-lg border border-commute-border p-4 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight truncate">{entry.origin} → {entry.destination}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.departure_time} · {entry.transport_mode.replace('_', ' ')}</p>
              </div>
              <span className="text-xs font-bold ml-3 shrink-0" style={{ color: riskColor(entry.risk_label) }}>
                {entry.risk_score}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
