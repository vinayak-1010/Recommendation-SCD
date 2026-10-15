import type { DayType, TransportMode, Minutes } from './types.ts';

export interface TrafficBucket {
  start: Minutes;
  end: Minutes;
  p50: number;
  p80: number;
  label: string;
}

export interface TrafficProfile {
  dayType: DayType;
  direction: 'up' | 'down' | 'city';
  buckets: TrafficBucket[];
}

export interface TrafficDataset {
  profiles: TrafficProfile[];
}

export class TrafficEngine {
  private profiles: Map<string, TrafficProfile> = new Map();

  constructor(data: TrafficDataset) {
    for (const p of data.profiles) {
      this.profiles.set(`${p.dayType}:${p.direction}`, p);
    }
  }

  public getMultiplier(
    dayType: DayType,
    direction: 'up' | 'down' | 'city',
    timeMinutes: Minutes,
    percentile: 'p50' | 'p80' = 'p50'
  ): { multiplier: number; label: string } {
    const key = `${dayType}:${direction}`;
    const profile = this.profiles.get(key) || this.profiles.get(`weekday:${direction}`);

    if (!profile) {
      return { multiplier: percentile === 'p80' ? 1.25 : 1.1, label: 'Standard flow' };
    }

    const t = timeMinutes % 1440;
    const bucket = profile.buckets.find(b => t >= b.start && t < b.end);

    if (bucket) {
      return {
        multiplier: percentile === 'p80' ? bucket.p80 : bucket.p50,
        label: bucket.label
      };
    }

    return { multiplier: percentile === 'p80' ? 1.25 : 1.1, label: 'Standard conditions' };
  }

  public calculateLegDuration(
    freeFlowMin: number,
    dayType: DayType,
    direction: 'up' | 'down' | 'city',
    departureMin: Minutes,
    mode: TransportMode,
    percentile: 'p50' | 'p80' = 'p50'
  ): { totalDurationMin: number; trafficLabel: string; drivingMin: number } {
    const { multiplier, label } = this.getMultiplier(dayType, direction, departureMin, percentile);

    let modeFactor = 1.0;
    let modeBuffer = 0;

    switch (mode) {
      case 'car':
        // Hill traffic queues affect cars; city parking takes time
        modeFactor = 1.0;
        modeBuffer = direction === 'up' || direction === 'down' ? 5 : 3;
        break;
      case 'bike':
        // Two-wheelers navigate city choke points faster, but still queue on single-lane hills
        modeFactor = direction === 'city' ? 0.9 : 0.95;
        modeBuffer = 2;
        break;
      case 'cab':
        // Includes dispatch / pickup arrival wait
        modeFactor = 1.0;
        modeBuffer = 5;
        break;
      case 'public':
        // Shared jeeps and buses stop frequently
        modeFactor = 1.35;
        modeBuffer = 15;
        break;
      case 'walk':
        modeFactor = 1.0;
        modeBuffer = 0;
        break;
    }

    const drivingMin = Math.round(freeFlowMin * multiplier * modeFactor);
    const totalDurationMin = drivingMin + modeBuffer;

    return {
      totalDurationMin,
      drivingMin,
      trafficLabel: label
    };
  }
}
