export type SeverityLevel = 'high' | 'medium' | 'low';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates: [number, number]; // [lat, lng]
  severity: SeverityLevel;
  category: 'cyberbullying' | 'sextortion' | 'threat' | 'doxxing' | 'scam';
  timestamp: string;
  source: string;
  verified: boolean;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  location: string;
  timestamp: string;
  actionRequired: boolean;
}

export interface DataSource {
  name: string;
  type: 'social' | 'news' | 'forum' | 'website';
  status: 'active' | 'inactive' | 'error';
  lastCrawl: string;
  itemsCollected: number;
}

export interface TrendData {
  date: string;
  high: number;
  medium: number;
  low: number;
}

export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Cyberbullying targeting female students',
    description: 'Multiple reports of coordinated harassment on social media',
    location: 'Nairobi, University of Nairobi',
    coordinates: [-1.2864, 36.8172],
    severity: 'high',
    category: 'cyberbullying',
    timestamp: '2024-01-15T10:30:00Z',
    source: 'Twitter',
    verified: true,
  },
  {
    id: '2',
    title: 'Fake modeling agency scam',
    description: 'Suspicious recruitment posts requesting personal photos',
    location: 'Mombasa',
    coordinates: [-4.0435, 39.6682],
    severity: 'high',
    category: 'scam',
    timestamp: '2024-01-15T09:15:00Z',
    source: 'Facebook',
    verified: true,
  },
  {
    id: '3',
    title: 'Sextortion attempt reported',
    description: 'Blackmail threats involving intimate images',
    location: 'Kisumu',
    coordinates: [-0.0917, 34.7680],
    severity: 'high',
    category: 'sextortion',
    timestamp: '2024-01-15T08:45:00Z',
    source: 'WhatsApp Report',
    verified: false,
  },
  {
    id: '4',
    title: 'Harassment patterns detected',
    description: 'Coordinated harassment campaign identified',
    location: 'Nakuru',
    coordinates: [-0.3031, 36.0800],
    severity: 'medium',
    category: 'threat',
    timestamp: '2024-01-15T07:20:00Z',
    source: 'Instagram',
    verified: true,
  },
  {
    id: '5',
    title: 'Doxxing incident',
    description: 'Personal information shared without consent',
    location: 'Eldoret',
    coordinates: [0.5143, 35.2698],
    severity: 'medium',
    category: 'doxxing',
    timestamp: '2024-01-15T06:10:00Z',
    source: 'Reddit',
    verified: false,
  },
  {
    id: '6',
    title: 'Low-level harassment',
    description: 'Single instance of offensive messaging',
    location: 'Thika',
    coordinates: [-1.0332, 37.0693],
    severity: 'low',
    category: 'cyberbullying',
    timestamp: '2024-01-15T05:30:00Z',
    source: 'TikTok',
    verified: false,
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    title: 'Critical: Organized sextortion ring detected',
    description: 'Multiple fake job postings linked to same phone number across platforms',
    severity: 'high',
    location: 'Nairobi CBD',
    timestamp: '2024-01-15T10:45:00Z',
    actionRequired: true,
  },
  {
    id: 'a2',
    title: 'Spike in harassment at University Campus',
    description: 'Unusual increase in cyberbullying incidents targeting female students',
    severity: 'high',
    location: 'University of Nairobi',
    timestamp: '2024-01-15T09:30:00Z',
    actionRequired: true,
  },
  {
    id: 'a3',
    title: 'Review Required: Potential doxxing case',
    description: 'Personal information shared, verification needed',
    severity: 'medium',
    location: 'Mombasa',
    timestamp: '2024-01-15T08:15:00Z',
    actionRequired: false,
  },
];

export const mockDataSources: DataSource[] = [
  {
    name: 'Twitter/X Public Feed',
    type: 'social',
    status: 'active',
    lastCrawl: '2 minutes ago',
    itemsCollected: 1247,
  },
  {
    name: 'Facebook Public Posts',
    type: 'social',
    status: 'active',
    lastCrawl: '5 minutes ago',
    itemsCollected: 856,
  },
  {
    name: 'Kenya News Sites',
    type: 'news',
    status: 'active',
    lastCrawl: '10 minutes ago',
    itemsCollected: 423,
  },
  {
    name: 'Reddit Kenya Threads',
    type: 'forum',
    status: 'active',
    lastCrawl: '15 minutes ago',
    itemsCollected: 312,
  },
  {
    name: 'Instagram Analysis',
    type: 'social',
    status: 'error',
    lastCrawl: '2 hours ago',
    itemsCollected: 0,
  },
];

export const mockTrendData: TrendData[] = [
  { date: 'Jan 8', high: 5, medium: 12, low: 28 },
  { date: 'Jan 9', high: 7, medium: 15, low: 32 },
  { date: 'Jan 10', high: 4, medium: 11, low: 25 },
  { date: 'Jan 11', high: 8, medium: 18, low: 35 },
  { date: 'Jan 12', high: 6, medium: 14, low: 30 },
  { date: 'Jan 13', high: 9, medium: 20, low: 38 },
  { date: 'Jan 14', high: 11, medium: 22, low: 42 },
  { date: 'Jan 15', high: 13, medium: 25, low: 45 },
];
