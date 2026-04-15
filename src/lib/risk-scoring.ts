export type TransportMode = 'two_wheeler' | 'car' | 'auto' | 'bus';
export type RiskLabel = 'high' | 'moderate' | 'low';

export interface RiskResult {
  score: number;
  label: RiskLabel;
  color: string;
  delayMinutes: number;
  factors: string[];
  bestDepartureTime: string;
}

function getHour(timeStr: string): number {
  const [h] = timeStr.split(':').map(Number);
  return h;
}

export function calculateRisk(
  departureTime: string,
  dayOfWeek: string,
  transportMode: TransportMode
): RiskResult {
  let score = 0;
  const factors: string[] = [];
  const hour = getHour(departureTime);
  const isWeekday = !['Saturday', 'Sunday'].includes(dayOfWeek);

  // Peak hours
  if (hour >= 8 && hour < 10) {
    score += 35;
    factors.push('Morning peak hours (8-10 AM): +35');
  } else if (hour >= 17 && hour < 20) {
    score += 40;
    factors.push('Evening peak hours (5-8 PM): +40');
  } else if (hour >= 21 || hour < 5) {
    score += 25;
    factors.push('Night hours (9 PM - 5 AM): +25');
  }

  // Weekday rush
  if (isWeekday && ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 20))) {
    score += 20;
    factors.push('Weekday rush hour bonus: +20');
  }

  // Weekend discount
  if (!isWeekday) {
    score -= 15;
    factors.push('Weekend discount: -15');
  }

  // Transport mode
  const modeScores: Record<TransportMode, number> = {
    two_wheeler: 15,
    auto: 10,
    car: 5,
    bus: 0,
  };
  const modeAdd = modeScores[transportMode];
  if (modeAdd > 0) {
    score += modeAdd;
    factors.push(`Transport mode (${transportMode.replace('_', ' ')}): +${modeAdd}`);
  }

  // Random incident
  if (Math.random() < 0.4) {
    const incident = Math.floor(Math.random() * 21);
    if (incident > 0) {
      score += incident;
      factors.push(`⚠️ Reported incident on route: +${incident}`);
    }
  }

  score = Math.max(0, Math.min(100, score));

  const label: RiskLabel = score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low';
  const color = label === 'high' ? '#ef4444' : label === 'moderate' ? '#f59e0b' : '#22c55e';

  // Delay estimation
  const delayMinutes = Math.round(score * 0.6);

  // Best departure suggestion
  let bestHour = hour;
  if (hour >= 8 && hour < 10) bestHour = 10;
  else if (hour >= 17 && hour < 20) bestHour = 15;
  const savedMinutes = Math.max(0, delayMinutes - Math.round(Math.max(0, score - 30) * 0.3));
  const bestDepartureTime = `${String(bestHour).padStart(2, '0')}:${departureTime.split(':')[1] || '00'}`;

  return { score, label, color, delayMinutes, factors, bestDepartureTime };
}
