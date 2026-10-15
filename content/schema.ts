/**
 * CONTENT SCHEMA & VALIDATION TYPES
 * AWS Student Community Day 2026 · Explore Doon × Mussoorie
 */

export type ZoneType = 'valley' | 'hills' | 'river' | 'outskirts';

export interface PlaceContent {
  id: string;
  name: string;
  aliases?: string[];
  zone: ZoneType;
  cluster: string;
  lat: number;
  lng: number;
  tags: string[];
  bestTime: string;
  durationMin: number;
  fee: string;
  hours: string;
  closedDays?: string[];
  seasonality?: string;
  bestSeasons?: string[];
  accessibility: {
    wheelchair: boolean;
    elderFriendly: boolean;
    strenuous: boolean;
  };
  foodNearby: string;
  tips: string[];
  studentPickNote?: string;
  images: string[];
  sources?: string[];
  lastVerified: string;
  verify: boolean; // Flagged true when entry fee / timings must be confirmed locally
  whySpeakersLoveIt?: string;
}

export interface CuratedRoute {
  id: string;
  title: string;
  subtitle: string;
  zone: ZoneType;
  durationHours: number;
  leaveBy: string;
  recommendedTransport: 'cab' | 'car' | 'bike' | 'walk';
  badge: string;
  coverImage: string;
  description: string;
  stops: string[]; // place IDs
  whyThisOrder: string;
  sunsetNotice?: string;
}

export function validatePlace(p: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!p.id || typeof p.id !== 'string') errors.push('Missing or invalid id');
  if (!p.name || typeof p.name !== 'string') errors.push('Missing or invalid name');
  if (typeof p.lat !== 'number' || typeof p.lng !== 'number') errors.push(`Invalid coords for ${p.id}`);
  if (!Array.isArray(p.tags)) errors.push(`Invalid tags for ${p.id}`);
  if (typeof p.verify !== 'boolean') errors.push(`Missing verify flag for ${p.id}`);
  return { valid: errors.length === 0, errors };
}
