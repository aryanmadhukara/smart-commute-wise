import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fuzzyMatchLocation, BANGALORE_CENTER } from '@/lib/locations';
import type { RiskResult } from '@/lib/risk-scoring';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function generateCurvedRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  const steps = 20;
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const offsetLat = (end.lng - start.lng) * 0.1;
  const offsetLng = -(end.lat - start.lat) * 0.1;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat =
      (1 - t) * (1 - t) * start.lat +
      2 * (1 - t) * t * (midLat + offsetLat) +
      t * t * end.lat;
    const lng =
      (1 - t) * (1 - t) * start.lng +
      2 * (1 - t) * t * (midLng + offsetLng) +
      t * t * end.lng;
    points.push({ lat, lng });
  }
  return points;
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

interface CommuteMapProps {
  origin: string;
  destination: string;
  riskResult?: RiskResult;
}

export function CommuteMap({ origin, destination, riskResult }: CommuteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMaps()
      .then(() => setIsLoaded(true))
      .catch(() => setError('Failed to load Google Maps. Check your API key.'));
  }, []);

  // Initialize map and update markers/routes
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    const center = { lat: BANGALORE_CENTER[0], lng: BANGALORE_CENTER[1] };

    // Create map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ saturation: -20 }],
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8e6f5' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ lightness: 30 }],
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
      });
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Resolve locations
    const startLoc = fuzzyMatchLocation(origin);
    const endLoc = fuzzyMatchLocation(destination);
    const startPos = startLoc
      ? { lat: startLoc.lat, lng: startLoc.lng }
      : { lat: BANGALORE_CENTER[0], lng: BANGALORE_CENTER[1] };
    const endPos = endLoc
      ? { lat: endLoc.lat, lng: endLoc.lng }
      : { lat: BANGALORE_CENTER[0] + 0.05, lng: BANGALORE_CENTER[1] + 0.1 };

    const routeColor = riskResult?.color || '#4285F4';

    // Draw curved route
    const routePoints = generateCurvedRoute(startPos, endPos);
    polylineRef.current = new google.maps.Polyline({
      path: routePoints,
      geodesic: false,
      strokeColor: routeColor,
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    polylineRef.current.setMap(map);

    // Origin marker
    const originMarker = new google.maps.Marker({
      position: startPos,
      map,
      title: startLoc?.name || origin,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
    const originInfo = new google.maps.InfoWindow({
      content: `<div style="font-weight:600;font-size:13px;padding:2px 4px">${startLoc?.name || origin}</div>`,
    });
    originMarker.addListener('click', () => originInfo.open(map, originMarker));
    markersRef.current.push(originMarker);

    // Destination marker
    const destMarker = new google.maps.Marker({
      position: endPos,
      map,
      title: endLoc?.name || destination,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
    const destInfo = new google.maps.InfoWindow({
      content: `<div style="font-weight:600;font-size:13px;padding:2px 4px">${endLoc?.name || destination}</div>`,
    });
    destMarker.addListener('click', () => destInfo.open(map, destMarker));
    markersRef.current.push(destMarker);

    // High risk warning marker
    if (riskResult && riskResult.score > 70) {
      const midPoint = routePoints[Math.floor(routePoints.length / 2)];
      const warningMarker = new google.maps.Marker({
        position: midPoint,
        map,
        title: 'High risk zone',
        icon: {
          url: 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><text x="4" y="18" font-size="16">⚠️</text></svg>'
          ),
          scaledSize: new google.maps.Size(28, 28),
        },
      });
      const warningInfo = new google.maps.InfoWindow({
        content: '<div style="font-weight:600;font-size:13px;padding:2px 4px;color:#dc2626">⚠ High risk zone</div>',
      });
      warningMarker.addListener('click', () => warningInfo.open(map, warningMarker));
      markersRef.current.push(warningMarker);
    }

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(startPos);
    bounds.extend(endPos);
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }, [isLoaded, origin, destination, riskResult]);

  return (
    <Card className="border-commute-border shadow-commute overflow-hidden">
      <div ref={mapContainerRef} style={{ height: '380px', width: '100%' }}>
        {!isLoaded && !error && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Loading Google Maps...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-destructive text-sm">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
}
