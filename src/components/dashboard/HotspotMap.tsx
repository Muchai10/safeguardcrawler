import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '@/data/mockData';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HotspotMapProps {
  incidents: Incident[];
}

export const HotspotMap = ({ incidents }: HotspotMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Kenya
    const map = L.map(mapContainerRef.current).setView([-1.2864, 36.8172], 7);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each incident
    incidents.forEach((incident) => {
      const color =
        incident.severity === 'high'
          ? '#dc2626'
          : incident.severity === 'medium'
          ? '#ea580c'
          : '#2563eb';

      const marker = L.circleMarker(incident.coordinates, {
        radius: incident.severity === 'high' ? 12 : incident.severity === 'medium' ? 9 : 6,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${incident.title}</h3>
          <p class="text-xs mb-1">${incident.description}</p>
          <p class="text-xs text-gray-600"><strong>Location:</strong> ${incident.location}</p>
          <p class="text-xs text-gray-600"><strong>Severity:</strong> ${incident.severity.toUpperCase()}</p>
          <p class="text-xs text-gray-600"><strong>Category:</strong> ${incident.category}</p>
          <p class="text-xs text-gray-600"><strong>Source:</strong> ${incident.source}</p>
        </div>
      `);
    });
  }, [incidents]);

  return (
    <Card className="p-6 h-full">
      <div className="mb-4">
        <h2 className="text-xl font-bold">GBV Hotspot Map</h2>
        <p className="text-sm text-muted-foreground">Real-time incident locations across Kenya</p>
      </div>
      <div ref={mapContainerRef} className="h-[500px] w-full rounded-lg overflow-hidden border border-border" />
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-high" />
          <span>High Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-medium" />
          <span>Medium Severity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-low" />
          <span>Low Severity</span>
        </div>
      </div>
    </Card>
  );
};
