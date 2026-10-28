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

    // Prefer a real corridor path when two clusters connect through another
    // mapped cluster (for example Mussoorie Road → town → Landour). Only use
    // the campus relay above when the regional route graph has no connection.
    const shortestPath = (mode: TransportMode): RouteEntry[] | null => {
      const costs = new Map<string, number>([[fromCluster, 0]]);
      const paths = new Map<string, RouteEntry[]>([[fromCluster, []]]);
      const pending = new Set<string>([fromCluster]);
      while (pending.size) {
        let current = '';
        let best = Infinity;
        for (const node of pending) {
          const cost = costs.get(node) ?? Infinity;
          if (cost < best) { best = cost; current = node; }
        }
        if (!current) break;
        pending.delete(current);
        if (current === toCluster) return paths.get(current) || [];

        for (const edge of this.entries.values()) {
          let next: string | null = null;
          let traversed = edge;
          if (edge.from === current) next = edge.to;
          else if (!edge.directional && edge.to === current) {
            next = edge.from;
            traversed = { ...edge, from: current, to: next };
          }
          if (!next || next === current) continue;
          const candidateCost = best + (edge.freeFlowMin[mode] ?? edge.freeFlowMin.car);
          if (candidateCost < (costs.get(next) ?? Infinity)) {
            costs.set(next, candidateCost);
            paths.set(next, [...(paths.get(current) || []), traversed]);
            pending.add(next);
          }
        }
      }
      return null;
    };
    const carPath = shortestPath('car');
    if (carPath?.length) {
      const modes: TransportMode[] = ['car', 'bike', 'cab', 'public', 'walk'];
      const freeFlowMin = Object.fromEntries(modes.map(mode => {
        const route = shortestPath(mode);
        return [mode, route?.reduce((sum, edge) => sum + (edge.freeFlowMin[mode] ?? edge.freeFlowMin.car), 0) ?? 70];
      })) as Record<TransportMode, number>;
      const directionType = carPath.some(edge => edge.directionType === 'up') ? 'up'
        : carPath.some(edge => edge.directionType === 'down') ? 'down' : 'city';
      return {
        from: fromCluster,
        to: toCluster,
        distanceKm: carPath.reduce((sum, edge) => sum + edge.distanceKm, 0),
        freeFlowMin,
        directional: true,
        directionType
      };
    }

    // No mapped regional connection: route via campus conservatively instead
    // of pretending that two distant day trips are a quick city hop.
    const firstLeg = this.entries.get(`${fromCluster}->campus`);
    const secondLeg = this.entries.get(`campus->${toCluster}`);
    if (firstLeg && secondLeg) {
      const modes: TransportMode[] = ['car', 'bike', 'cab', 'public', 'walk'];
      const freeFlowMin = Object.fromEntries(modes.map(mode => [
        mode,
        firstLeg.freeFlowMin[mode] + secondLeg.freeFlowMin[mode]
      ])) as Record<TransportMode, number>;
      return {
        from: fromCluster,
        to: toCluster,
        distanceKm: firstLeg.distanceKm + secondLeg.distanceKm,
        freeFlowMin,
        directional: true,
        directionType: 'city'
      };
    }

    // Last-resort estimate for incomplete data; make it visibly cautious.
    return {
      from: fromCluster,
      to: toCluster,
      distanceKm: 40.0,
      freeFlowMin: { car: 70, bike: 62, cab: 70, public: 105, walk: 420 },
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
