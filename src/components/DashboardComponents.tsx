'use client';

import { AlertTriangle, Activity, Eye, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRunScraper } from '@/hooks/useFastApiData';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  severityColor?: 'high' | 'low' | 'default';
}

export const StatsCard = ({ title, value, icon: Icon, severityColor = 'default' }: StatsCardProps) => {
  const colors: any = { high: 'border-red-500', low: 'border-green-500', default: 'border-gray-300' };
  return (
    <div className={`p-4 bg-card rounded-lg border-l-4 ${colors[severityColor]} shadow-sm`}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export const ControlPanel = () => {
  const { mutate: runScraper, isLoading, error } = useRunScraper();

  return (
    <div className="p-4 bg-card rounded-lg border border-border shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-3">Scraper Controls</h3>
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={isLoading} onClick={() => runScraper("/run-news-scraper")}>Run News Scraper</button>
        <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={isLoading} onClick={() => runScraper("/run-twitter-scraper")}>Run Twitter Scraper</button>
        <button className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50" disabled={isLoading} onClick={() => runScraper("/run-scrapers")}>Run All</button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground mt-2">Running… please wait.</p>}
      {error && <p className="text-sm text-red-600 mt-2">Error running scraper.</p>}
    </div>
  );
};

export const HotspotMap = ({ incidents }: { incidents: any[] }) => {
  const points = incidents.flatMap(a => a.locations || []).filter((loc: any) => loc.lat && loc.lng);
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden mb-6">
      <MapContainer center={[0.0236, 37.9062]} zoom={6} className="w-full h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p, idx) => (
          <Marker key={idx} position={[p.lat, p.lng]}>
            <Popup>{p.name || 'Hotspot'} <br /> Threats: {p.threat_count || 1}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export const TrendsChart = ({ data }: { data: any[] }) => {
  const trends = data.reduce((acc: any, cur: any) => {
    const date = cur.created_at?.split('T')[0] || 'Unknown';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.keys(trends).map(date => ({ date, count: trends[date] }));

  return (
    <div className="w-full h-64 bg-card p-4 rounded-lg border border-border shadow-sm mb-6">
      <h3 className="font-semibold mb-2">Trend of Alerts</h3>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3498db" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LiveAlertsPanel = ({ alerts }: { alerts: any[] }) => {
  return (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm h-96 overflow-y-auto mb-6">
      <h3 className="font-semibold mb-3">Live Alerts</h3>
      {alerts.length === 0 && <p>No alerts currently.</p>}
      {alerts.map(a => (
        <div key={a.id} className={`p-2 mb-2 rounded border-l-4 ${a.severity_tier === 'HIGH' ? 'border-red-500' : 'border-blue-500'}`}>
          <p className="font-semibold">{a.title}</p>
          <p className="text-xs text-muted-foreground">{a.created_at}</p>
        </div>
      ))}
    </div>
  );
};
