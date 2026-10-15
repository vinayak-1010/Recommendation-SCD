import type { Place, TripRequest, Interest, Minutes } from './types.ts';

export interface ItineraryCandidate {
  stops: Place[];
  durations: number[];
  travelTimes: number[];
  distances: number[];
  clusters: string[];
  totalTravelMin: number;
  totalSightseeingMin: number;
  totalMealMin: number;
  finishTimeP50: Minutes;
  finishTimeP80: Minutes;
}

export function computeInterestCredit(stops: Place[], interests: Interest[]): number {
  if (!interests.length) return 0.7; // Neutral baseline if no specific vibe selected

  let totalCredit = 0;

  for (const interest of interests) {
    let topAffinity = 0;
    let secondAffinity = 0;

    for (const stop of stops) {
      const aff = stop.affinity?.[interest] || 0;
      if (aff > topAffinity) {
        secondAffinity = topAffinity;
        topAffinity = aff;
      } else if (aff > secondAffinity) {
        secondAffinity = aff;
      }
    }

    // Max credit + small bonus for second match, capped at 1.0
    const interestScore = Math.min(1.0, topAffinity + 0.25 * secondAffinity);
    totalCredit += interestScore;
  }

  return totalCredit / interests.length;
}

export function computeExperienceDiversity(stops: Place[]): number {
  if (stops.length <= 1) return 1.0;

  const typeCounts = new Map<string, number>();
  let penalties = 0;
  let viewpointCount = 0;

  for (const s of stops) {
    const count = (typeCounts.get(s.experienceType) || 0) + 1;
    typeCounts.set(s.experienceType, count);

    if (count > 1) {
      // Repeat penalty
      penalties += 0.5 * (count - 1);
    }

    if (s.experienceType === 'viewpoint' || s.experienceType === 'ropeway-viewpoint') {
      viewpointCount++;
      if (viewpointCount > 1) {
        penalties += 0.6; // Heavy penalty for multiple viewpoints in same short trip
      }
    }
  }

  return Math.max(0.1, 1.0 - (penalties / stops.length));
}

export function computeBacktrackingPenalty(clusters: string[]): number {
  if (clusters.length <= 2) return 0;

  let penalty = 0;
  const visited = new Set<string>();
  let prev = clusters[0];
  visited.add(prev);

  for (let i = 1; i < clusters.length; i++) {
    const curr = clusters[i];
    if (curr !== prev) {
      if (visited.has(curr)) {
        // Returned to a previously exited cluster! Backtracking!
        penalty += 1.0;
      }
      visited.add(curr);
      prev = curr;
    }
  }

  return penalty;
}

export function computeTimeOfDayFit(stops: Place[], arrivalTimes: Minutes[]): number {
  let fitSum = 0;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const arrival = arrivalTimes[i];

    if (!stop.bestTime) {
      fitSum += 0.8;
      continue;
    }

    const [bH, bM] = stop.bestTime.from.split(':').map(Number);
    const [eH, eM] = stop.bestTime.to.split(':').map(Number);
    const fromMin = bH * 60 + bM;
    const toMin = eH * 60 + eM;

    if (arrival >= fromMin && arrival <= toMin) {
      fitSum += 1.0;
    } else {
      const dist = Math.min(Math.abs(arrival - fromMin), Math.abs(arrival - toMin));
      fitSum += Math.max(0.2, 1.0 - (dist / 180));
    }
  }

  return stops.length ? fitSum / stops.length : 0.8;
}

export function computePaceFit(
  activeMinutes: number,
  usableWindowMin: number,
  pace: 'relaxed' | 'balanced' | 'packed'
): number {
  const targetRatio = pace === 'relaxed' ? 0.60 : pace === 'balanced' ? 0.70 : 0.80;
  const actualRatio = activeMinutes / Math.max(1, usableWindowMin);
  const diff = Math.abs(actualRatio - targetRatio);
  return Math.max(0, 1.0 - diff * 2);
}

export function scoreItinerary(
  candidate: ItineraryCandidate,
  request: TripRequest,
  arrivalTimes: Minutes[],
  config: any
): number {
  const weights = config.weights || {
    w1_interestCredit: 35.0,
    w2_timeOfDayFit: 15.0,
    w3_mealFit: 20.0,
    w4_experienceDiversity: 18.0,
    w5_paceFit: 12.0,
    w6_travelCost: 40.0,
    w7_backtracking: 45.0,
    w8_riskPenalty: 30.0,
    w9_detourPenalty: 25.0
  };

  const interestScore = computeInterestCredit(candidate.stops, request.interests);
  const diversityScore = computeExperienceDiversity(candidate.stops);
  const todScore = computeTimeOfDayFit(candidate.stops, arrivalTimes);
  const paceScore = computePaceFit(
    candidate.totalSightseeingMin + candidate.totalMealMin,
    (request.returnBy - request.start),
    request.pace
  );

  const backtracking = computeBacktrackingPenalty(candidate.clusters);
  const travelCostNorm = Math.min(2.0, candidate.totalTravelMin / 150);

  // Meal fit: if trip > 5h, has at least one meal
  const usableH = (request.returnBy - request.start) / 60;
  let mealFit = 1.0;
  const hasMeal = candidate.stops.some(s => s.kind === 'meal' || s.experienceType === 'breakfast-local' || s.experienceType === 'restaurant-sitdown');
  if (usableH >= 5 && !hasMeal) {
    mealFit = 0.3;
  }

  const score =
    (weights.w1_interestCredit * interestScore) +
    (weights.w2_timeOfDayFit * todScore) +
    (weights.w3_mealFit * mealFit) +
    (weights.w4_experienceDiversity * diversityScore) +
    (weights.w5_paceFit * paceScore) -
    (weights.w6_travelCost * travelCostNorm) -
    (weights.w7_backtracking * backtracking * 20.0);

  return Math.max(0, Math.round(score * 10) / 10);
}
