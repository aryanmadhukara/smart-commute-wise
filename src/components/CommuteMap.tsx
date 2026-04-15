import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fuzzyMatchLocation, BANGALORE_CENTER } from '@/lib/locations';
import type { RiskResult } from '@/lib/risk-scoring';

function generateCurvedRoute(start: [number, number], end: [number, number]): [number, number][] {
  const points: [number, number][] = [];
  const steps = 20;
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const offsetLat = (end[1] - start[1]) * 0.1;
  const offsetLng = -(end[0] - start[0]) * 0.1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * (midLat + offsetLat) + t * t * end[0];
    const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * (midLng + offsetLng) + t * t * end[1];
    points.push([lat, lng]);
  }
  return points;
}

interface CommuteMapProps {
  origin: string;
  destination: string;
  riskResult?: RiskResult;
}

export function CommuteMap({ origin, destination, riskResult }: CommuteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (cancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const startLoc = fuzzyMatchLocation(origin);
      const endLoc = fuzzyMatchLocation(destination);
      const startPos: [number, number] = startLoc ? [startLoc.lat, startLoc.lng] : BANGALORE_CENTER;
      const endPos: [number, number] = endLoc ? [endLoc.lat, endLoc.lng] : [BANGALORE_CENTER[0] + 0.05, BANGALORE_CENTER[1] + 0.1];
      const route = generateCurvedRoute(startPos, endPos);
      const routeColor = riskResult?.color || '#1a1a1a';

      const createIcon = (emoji: string) =>
        L.divIcon({
          html: `<div style="font-size:22px;text-align:center;line-height:1">${emoji}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

      const map = L.map(mapContainerRef.current).setView(BANGALORE_CENTER, 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      L.polyline(route, { color: routeColor, weight: 3, opacity: 0.7 }).addTo(map);

      L.marker(startPos, { icon: createIcon('●') })
        .addTo(map)
        .bindPopup(`${startLoc?.name || origin}`);

      L.marker(endPos, { icon: createIcon('◎') })
        .addTo(map)
        .bindPopup(`${endLoc?.name || destination}`);

      if (riskResult && riskResult.score > 70) {
        L.marker(route[Math.floor(route.length / 2)], { icon: createIcon('⚠') })
          .addTo(map)
          .bindPopup('High risk zone');
      }

      const bounds = L.latLngBounds([L.latLng(startPos[0], startPos[1]), L.latLng(endPos[0], endPos[1])]);
      map.fitBounds(bounds, { padding: [40, 40] });
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, origin, destination, riskResult]);

  return (
    <Card className="border-commute-border shadow-commute overflow-hidden">
      <div ref={mapContainerRef} style={{ height: '380px', width: '100%' }}>
        {!isClient && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading map...
          </div>
        )}
      </div>
    </Card>
  );
}
