import type { TransportMode, Minutes } from './types.ts';

export interface RouteEntry {
  from: string;
  to: string;
  distanceKm: number;
  freeFlowMin: Record<TransportMode, number>;
  directional: boolean;
  directionType: 'up' | 'down' | 'city';
}

export interface RouteDataset {
  matrix: RouteEntry[];
}

export class TravelMatrix {
  private entries: Map<string, RouteEntry> = new Map();

  constructor(data: RouteDataset) {
    for (const r of data.matrix) {
      this.entries.set(`${r.from}->${r.to}`, r);
    }
  }

  public getRoute(fromCluster: string, toCluster: string): RouteEntry {
    if (fromCluster === toCluster) {
      const same = this.entries.get(`${fromCluster}->${toCluster}`);
      if (same) return same;
      return {
        from: fromCluster,
        to: toCluster,
        distanceKm: 1.0,
        freeFlowMin: { car: 5, bike: 4, cab: 5, public: 8, walk: 15 },
        directional: false,
        directionType: 'city'
      };
    }

    const direct = this.entries.get(`${fromCluster}->${toCluster}`);
    if (direct) return direct;

    // Check reverse if non-directional exists
    const reverse = this.entries.get(`${toCluster}->${fromCluster}`);
    if (reverse && !reverse.directional) {
      return {
        ...reverse,
        from: fromCluster,
        to: toCluster
      };
    }

    // Fallback: transit through city or campus
    return {
      from: fromCluster,
      to: toCluster,
      distanceKm: 15.0,
      freeFlowMin: { car: 30, bike: 25, cab: 30, public: 45, walk: 180 },
      directional: false,
      directionType: 'city'
    };
  }

  public getFreeFlowTime(fromCluster: string, toCluster: string, mode: TransportMode): { durationMin: number; distanceKm: number; directionType: 'up' | 'down' | 'city' } {
    const route = this.getRoute(fromCluster, toCluster);
    const durationMin = route.freeFlowMin[mode] ?? route.freeFlowMin.car;
    return {
      durationMin,
      distanceKm: route.distanceKm,
      directionType: route.directionType
    };
  }
}
