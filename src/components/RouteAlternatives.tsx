import { Card, CardContent } from '@/components/ui/card';
import type { RiskResult } from '@/lib/risk-scoring';

interface RouteAlternativesProps {
  riskResult: RiskResult;
  departureTime: string;
}

export function RouteAlternatives({ riskResult, departureTime }: RouteAlternativesProps) {
  const baseTime = riskResult.delayMinutes + 25;
  const routes = [
    { name: 'Main Route', time: baseTime, risk: riskResult.label, color: riskResult.color },
    { name: 'Bypass Route', time: baseTime + 8, risk: riskResult.score > 50 ? 'moderate' : 'low', color: riskResult.score > 50 ? '#f59e0b' : '#22c55e' },
    { name: 'Metro + Last Mile', time: baseTime + 12, risk: 'low', color: '#22c55e' },
  ];

  return (
    <Card className="border-commute-border shadow-commute card-hover">
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Route Alternatives</p>
        <div className="space-y-3">
          {routes.map((r, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${i === 0 ? 'border-foreground/20 bg-accent/50' : 'border-commute-border'}`}>
              <div>
                <p className="text-sm font-semibold tracking-tight">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.time} min estimated</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: r.color }}>
                {r.risk}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
