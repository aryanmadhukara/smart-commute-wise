import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  const level = (h >= 8 && h < 10) || (h >= 17 && h < 20) ? 'High' : (h >= 10 && h < 12) || (h >= 14 && h < 17) ? 'Medium' : 'Low';
  return { hour: `${h}`, label: `${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`, level, value: level === 'High' ? 90 : level === 'Medium' ? 55 : 25 };
});

const COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

export function CongestionForecast({ currentHour }: { currentHour: number }) {
  return (
    <Card className="border-commute-border shadow-commute card-hover">
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Hourly Congestion</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={HOURS} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={1} />
            <YAxis hide />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {HOURS.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[entry.level]}
                  opacity={parseInt(entry.hour) === currentHour ? 1 : 0.4}
                  stroke={parseInt(entry.hour) === currentHour ? 'var(--foreground)' : 'none'}
                  strokeWidth={parseInt(entry.hour) === currentHour ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-5 mt-3">
          {Object.entries(COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
