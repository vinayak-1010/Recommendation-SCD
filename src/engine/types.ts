export type Minutes = number; // Minutes from midnight (e.g. 08:00 = 480)

export type DayType = 'weekday' | 'saturday' | 'sunday' | 'holiday';

export type TransportMode = 'car' | 'bike' | 'cab' | 'public' | 'walk';

export type Interest =
  | 'spiritual'
  | 'nature'
  | 'cafes'
  | 'food'
  | 'views'
  | 'adventure'
  | 'heritage'
  | 'chill'
  | 'night';

export type GroupType = 'friends' | 'kids' | 'elders';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type Diet = 'any' | 'veg';
export type BudgetTier = 1 | 2 | 3 | 4;

export type VerificationStatus = 'verified' | 'reported' | 'estimated' | 'unknown';

export interface Verification {
  status: VerificationStatus;
  source?: string;
  checkedOn?: string;
}

export interface Place {
  id: string;
  name: string;
  aliases?: string[];
  kind: 'attraction' | 'meal' | 'cafe' | 'bar' | 'club' | 'stroll' | 'onroute';
  coords: { lat: number; lng: number; source: 'osm' | 'gmaps' | 'team' | 'unknown' } | null;
  cluster: string;
  experienceType: string;
  affinity: Partial<Record<Interest, number>>;
  role: 'primary' | 'secondary' | 'optional';
  visit: { min: number; typical: number; max: number };
  parkingWalk: { car: number; bike: number };
  hours: { open: string; close: string; days?: DayType[]; status?: Verification } | null;
  meal?: { slots: ('breakfast' | 'lunch' | 'snack' | 'dinner')[]; style: 'quick' | 'sit-down' | 'leisurely' };
  budget?: BudgetTier;
  veg?: 'veg' | 'both' | 'nonveg';
  alcohol?: boolean;
  suitability: { car: number; bike: number; public: number; kids: boolean; elders: boolean; strenuous: boolean };
  bestTime?: { from: string; to: string; why: string };
  notes: string;
  tips?: string[];
  images?: string[];
  restrictions?: string[];
  verification: Verification;
  routeKey?: string;
}

export interface TripRequest {
  date: string; // YYYY-MM-DD
  dayType?: DayType;
  start: Minutes;
  returnBy: Minutes;
  transport: TransportMode;
  interests: Interest[];
  group: GroupType;
  pace: Pace;
  budget?: BudgetTier;
  diet?: Diet;
  partySize?: number;
  departure?: {
    mode: 'none' | 'flight' | 'train';
    at: Minutes;
  };
  locks?: {
    include?: string[];
    exclude?: string[];
  };
  locale?: 'en' | 'hi';
}

export interface TimelineLeg {
  fromId: string;
  toId: string;
  mode: TransportMode;
  durationMin: number;
  distanceKm: number;
  trafficStatus: string;
}

export interface TimelineStop {
  place: Place;
  arrival: Minutes;
  departure: Minutes;
  durationMin: number;
  leg: TimelineLeg;
  role: 'primary' | 'secondary' | 'meal' | 'quick-stop';
  whyThisStop: string;
  whatToDo: string[];
  nextTransitionWhy: string;
  tip?: string;
  alternatives?: AlternativeStop[];
}

export interface AlternativeStop {
  place: Place;
  deltaDurationMin: number;
  deltaReturnMin: number;
  whyPrefer: string;
  fitsCurrentRoute: boolean;
  verification: Verification;
}

export interface Itinerary {
  id: string;
  title: string;
  leadSummary: string;
  stops: TimelineStop[];
  returnLeg: TimelineLeg;
  expectedReturn: Minutes; // p50
  latestSafeReturn: Minutes; // p80
  contingencyBufferMin: number;
  totalTravelMin: number;
  totalSightseeingMin: number;
  totalMealMin: number;
  totalBufferMin: number;
  estimatedCost?: {
    totalMin: number;
    totalMax: number;
    perPersonMin: number;
    perPersonMax: number;
    partySize: number;
  };
  compromises: string[];
  practicalTips: string[];
  objectiveScore: number;
  confidenceChip: string;
}
