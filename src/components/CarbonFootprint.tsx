import { Card, CardContent } from '@/components/ui/card';
import type { TransportMode } from '@/lib/risk-scoring';

const CO2_DATA: Record<TransportMode, { co2: number; label: string }> = {
  bus: { co2: 30, label: 'Bus' },
  two_wheeler: { co2: 50, label: 'Two Wheeler' },
  auto: { co2: 120, label: 'Auto' },
  car: { co2: 180, label: 'Car' },
};

export function CarbonFootprint({ selected }: { selected: TransportMode }) {
  const max = 180;
  return (
    <Card className="border-commute-border shadow-commute card-hover">
      <CardContent className="p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">Carbon Footprint (g CO₂/km)</p>
        <div className="space-y-4">
          {(Object.entries(CO2_DATA) as [TransportMode, typeof CO2_DATA[TransportMode]][]).map(([mode, data]) => (
            <div key={mode} className={`rounded-lg p-3 transition-all ${mode === selected ? 'bg-accent ring-1 ring-foreground/10' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{data.label}</span>
                <span className="text-xs font-semibold text-muted-foreground">{data.co2}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(data.co2 / max) * 100}%`,
                    backgroundColor: data.co2 <= 50 ? '#22c55e' : data.co2 <= 120 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
