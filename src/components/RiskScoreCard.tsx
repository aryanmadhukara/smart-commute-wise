import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { RiskResult } from '@/lib/risk-scoring';

interface RiskScoreCardProps {
  result: RiskResult;
  departureTime: string;
}

export function RiskScoreCard({ result, departureTime }: RiskScoreCardProps) {
  const Icon = result.label === 'high' ? AlertTriangle : result.label === 'moderate' ? Clock : CheckCircle;

  return (
    <div className="space-y-4">
      <Card className="border-commute-border shadow-commute card-hover overflow-hidden">
        <div className="h-1" style={{ backgroundColor: result.color }} />
        <CardContent className="pt-8 pb-8 text-center">
          <div className="text-7xl font-extrabold tracking-tighter" style={{ color: result.color }}>
            {result.score}
          </div>
          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: `${result.color}15`, color: result.color }}
          >
            <Icon className="h-3.5 w-3.5" />
            {result.label} risk
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Estimated delay: <span className="font-semibold text-foreground">{result.delayMinutes} min</span>
          </div>
          {result.delayMinutes > 10 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Best departure: <span className="font-semibold text-foreground">{result.bestDepartureTime}</span>
              <span className="text-muted-foreground"> (save ~{Math.round(result.delayMinutes * 0.4)} min)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk factors */}
      <Card className="border-commute-border shadow-commute">
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">Risk Factors</p>
          <ul className="space-y-2">
            {result.factors.map((f, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: result.color }} />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
