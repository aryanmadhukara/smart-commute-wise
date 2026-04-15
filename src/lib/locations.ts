export interface LocationCoord {
  name: string;
  lat: number;
  lng: number;
}

export const BANGALORE_LOCATIONS: LocationCoord[] = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'MG Road', lat: 12.9756, lng: 77.6068 },
  { name: 'Electronic City', lat: 12.8399, lng: 77.6770 },
  { name: 'Yeshwanthpur', lat: 13.0220, lng: 77.5440 },
  { name: 'Hebbal', lat: 13.0358, lng: 77.5970 },
  { name: 'Jayanagar', lat: 12.9250, lng: 77.5938 },
  { name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
  { name: 'HSR Layout', lat: 12.9081, lng: 77.6476 },
  { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
  { name: 'Silk Board', lat: 12.9173, lng: 77.6229 },
];

export function fuzzyMatchLocation(input: string): LocationCoord | null {
  const normalized = input.toLowerCase().trim();
  let bestMatch: LocationCoord | null = null;
  let bestScore = 0;

  for (const loc of BANGALORE_LOCATIONS) {
    const locName = loc.name.toLowerCase();
    if (locName === normalized) return loc;
    if (normalized.includes(locName) || locName.includes(normalized)) {
      const score = locName.length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = loc;
      }
    }
  }

  // Try partial matching
  if (!bestMatch) {
    for (const loc of BANGALORE_LOCATIONS) {
      const words = loc.name.toLowerCase().split(' ');
      for (const word of words) {
        if (normalized.includes(word) && word.length > 2) {
          bestMatch = loc;
          break;
        }
      }
      if (bestMatch) break;
    }
  }

  return bestMatch;
}

export const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];
