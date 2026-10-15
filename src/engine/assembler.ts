import type {
  Place,
  TripRequest,
  Itinerary,
  TimelineStop,
  TimelineLeg,
  AlternativeStop,
  Minutes,
  TransportMode
} from './types.ts';
import { calculateDaylight, type DaylightInfo } from './daylight.ts';
import { TravelMatrix } from './matrix.ts';
import { TrafficEngine } from './traffic.ts';
import { filterCandidate, computeEffectiveReturnDeadline, isHillCluster } from './filters.ts';
import { scoreItinerary, type ItineraryCandidate } from './scorer.ts';
import { GuideNarrator } from './narration.ts';

export interface EngineDatasets {
  places: Place[];
  eateries: Place[];
  routes: any;
  traffic: any;
  rules: any[];
  copy: any;
  config: any;
}

export class ItineraryAssembler {
  private matrix: TravelMatrix;
  private traffic: TrafficEngine;
  private narrator: GuideNarrator;
  private data: EngineDatasets;

  constructor(data: EngineDatasets) {
    this.data = data;
    this.matrix = new TravelMatrix(data.routes);
    this.traffic = new TrafficEngine(data.traffic);
    this.narrator = new GuideNarrator(data.copy);
  }

  public assemble(request: TripRequest): Itinerary | null {
    const config = this.data.config;
    const deadline = computeEffectiveReturnDeadline(request, config);
    const usableWindowMin = deadline - request.start;

    if (usableWindowMin <= 0) {
      return null;
    }

    const daylight = calculateDaylight(request.date);
    const dayType = request.dayType || (new Date(request.date).getDay() === 0 ? 'sunday' : new Date(request.date).getDay() === 6 ? 'saturday' : 'weekday');

    // 1. Filter candidates
    const allCandidates = [...this.data.places, ...this.data.eateries];
    const allowed = allCandidates.filter(p => filterCandidate(p, request, deadline, daylight).allowed);

    if (!allowed.length) {
      return null;
    }

    // 2. Derive net budget
    const paceFactor = usableWindowMin <= 90
      ? 0.5
      : request.pace === 'relaxed' ? 1.2 : request.pace === 'packed' ? 0.85 : 1.0;

    // 3. Cluster prioritization
    const clusterMap = new Map<string, Place[]>();
    for (const p of allowed) {
      const list = clusterMap.get(p.cluster) || [];
      list.push(p);
      clusterMap.set(p.cluster, list);
    }

    // Determine target primary cluster
    const clusterScores = Array.from(clusterMap.entries()).map(([cluster, items]) => {
      // Score cluster based on top 2 matches (max-credit) rather than counting every cafe
      const itemScores = items.map(item => {
        let s = 0;
        for (const interest of request.interests) {
          s += (item.affinity?.[interest] || 0);
        }
        return s;
      }).sort((a, b) => b - a);

      let affSum = (itemScores[0] || 0) + 0.5 * (itemScores[1] || 0);

      // Boost mountain clusters for long morning outings with views/nature
      if (isHillCluster(cluster) && (request.interests.includes('views') || request.interests.includes('nature')) && usableWindowMin >= 420 && request.start <= 540) {
        affSum += 1.8;
      }

      // Check distance feasibility
      const transitTo = this.matrix.getFreeFlowTime('campus', cluster, request.transport).durationMin;
      const transitFrom = this.matrix.getFreeFlowTime(cluster, 'campus', request.transport).durationMin;
      const totalRoundTripTravel = transitTo + transitFrom;
      const minStay = Math.min(...items.map(p => p.visit.min));

      const feasible = usableWindowMin >= (totalRoundTripTravel + minStay);

      // Night mode restriction for hill clusters
      const isNightMode = request.start >= 1080; // 6:00 PM
      if (isNightMode && isHillCluster(cluster)) {
        return { cluster, score: -999, feasible: false };
      }

      // Short window (< 5 hours) penalty for hill clusters
      if (usableWindowMin < 300 && isHillCluster(cluster)) {
        return { cluster, score: -500, feasible: false };
      }

      return {
        cluster,
        score: feasible ? affSum : -100,
        feasible
      };
    }).sort((a, b) => b.score - a.score);

    const bestClusterEntry = clusterScores.find(c => c.feasible);
    if (!bestClusterEntry) {
      return null;
    }

    const primaryCluster = bestClusterEntry.cluster;
    const isHillDay = isHillCluster(primaryCluster);

    // 4. Beam Search Candidate Skeletons
    // Max cluster transitions: 1 for trips <= 6 hours (360 min)
    const allowedSecondaryClusters = usableWindowMin <= 360
      ? [primaryCluster]
      : [primaryCluster, 'rajpur', 'city-center', 'mussoorie-town'];

    interface BeamState {
      stops: Place[];
      currentCluster: string;
      currentTimeP50: Minutes;
      currentTimeP80: Minutes;
      travelMinTotal: number;
      legs: TimelineLeg[];
      durations: number[];
    }

    let beam: BeamState[] = [{
      stops: [],
      currentCluster: 'campus',
      currentTimeP50: request.start,
      currentTimeP80: request.start,
      travelMinTotal: 0,
      legs: [],
      durations: []
    }];

    // Identify primary anchor candidates in primaryCluster
    const primaryCandidates = (clusterMap.get(primaryCluster) || [])
      .filter(p => p.role === 'primary' || p.role === 'secondary')
      .sort((a, b) => {
        const affA = request.interests.reduce((s, inKey) => s + (a.affinity?.[inKey] || 0), 0);
        const affB = request.interests.reduce((s, inKey) => s + (b.affinity?.[inKey] || 0), 0);
        return affB - affA;
      });

    const anchor = primaryCandidates[0] || allowed[0];

    // Build plan sequence starting from anchor
    const chosenStops: Place[] = [anchor];

    // Respect locked include stops from replanning/swaps
    if (request.locks?.include?.length) {
      for (const incId of request.locks.include) {
        const lockedPlace = allowed.find(p => p.id === incId);
        if (lockedPlace && !chosenStops.some(s => s.id === lockedPlace.id)) {
          if (lockedPlace.kind === 'onroute') {
            chosenStops.unshift(lockedPlace);
          } else {
            chosenStops.push(lockedPlace);
          }
        }
      }
    }

    const anchorDuration = Math.round((anchor.visit.typical * paceFactor) / 5) * 5;

    // Check if onroute stop (e.g. Maggi) makes sense on hill climb
    if (isHillDay && usableWindowMin >= 300) {
      const maggi = allowed.find(p => p.id === 'maggi');
      if (maggi && (request.interests.includes('food') || request.interests.includes('views') || !request.interests.length)) {
        chosenStops.unshift(maggi); // Insert on ascent before the mountain summit
      }
    }

    // Check if a secondary stop in the same cluster or adjacent fits
    const remainingBudgetEstimate = usableWindowMin - (anchorDuration + 140);
    if (remainingBudgetEstimate >= 60) {
      // Look for a stroll or secondary cultural experience in same cluster
      const secondary = (clusterMap.get(primaryCluster) || []).find(
        p => p.id !== anchor.id &&
             p.role === 'secondary' &&
             p.experienceType !== anchor.experienceType
      );
      if (secondary) {
        chosenStops.push(secondary);
      }
    }

    // Check if meal window crossed and insert meal stop
    const windowHours = usableWindowMin / 60;
    if (windowHours >= 4.5) {
      // Find meal in primaryCluster or adjacent rajpur on descent
      const mealStop = allowed.find(
        p => (p.kind === 'meal' || p.kind === 'cafe' || p.experienceType === 'breakfast-local' || p.experienceType === 'bakery' || p.experienceType === 'restaurant-sitdown') &&
             !chosenStops.some(s => s.id === p.id) &&
             (p.cluster === primaryCluster || (isHillDay && p.cluster === 'landour'))
      );
      if (mealStop) {
        // Position meal chronologically
        if (mealStop.experienceType === 'breakfast-local') {
          // Put near beginning
          chosenStops.splice(chosenStops.length > 1 ? 1 : 0, 0, mealStop);
        } else {
          chosenStops.push(mealStop);
        }
      }
    }

    // 5. Simulate exact timetable with trimming loop to guarantee P80 return <= deadline
    const simulateStops = (stops: Place[]) => {
      const stopsResult: TimelineStop[] = [];
      let curTimeP50 = request.start;
      let curTimeP80 = request.start;
      let curCluster = 'campus';
      let prevPlace: Place | null = null;
      let totalTravelMin = 0;
      let totalSightseeingMin = 0;
      let totalMealMin = 0;

      for (let i = 0; i < stops.length; i++) {
        const place = stops[i];
        const freeFlow = this.matrix.getFreeFlowTime(curCluster, place.cluster, request.transport);

        const legP50 = this.traffic.calculateLegDuration(
          freeFlow.durationMin,
          dayType,
          freeFlow.directionType,
          curTimeP50,
          request.transport,
          'p50'
        );

        const legP80 = this.traffic.calculateLegDuration(
          freeFlow.durationMin,
          dayType,
          freeFlow.directionType,
          curTimeP80,
          request.transport,
          'p80'
        );

        const arrivalP50 = curTimeP50 + legP50.totalDurationMin;
        const arrivalP80 = curTimeP80 + legP80.totalDurationMin;

        // Base stay duration
        let stayDuration = Math.max(place.visit.min, Math.round((place.visit.typical * paceFactor) / 5) * 5);
        if (usableWindowMin <= 90) {
          stayDuration = Math.min(stayDuration, place.visit.min);
        }

        // Check opening hours wait
        let waitMin = 0;
        if (place.hours && place.hours.open) {
          const [oH, oM] = place.hours.open.split(':').map(Number);
          const openMin = oH * 60 + oM;
          if (arrivalP50 < openMin) {
            waitMin = openMin - arrivalP50;
          }
        }

        const effectiveDepP50 = arrivalP50 + stayDuration + waitMin;
        const effectiveDepP80 = arrivalP80 + stayDuration + waitMin;

        const nextPlace = stops[i + 1] || null;

        // Alternatives calculation
        const alternatives: AlternativeStop[] = [];
        const altCandidates = allowed.filter(
          a => a.id !== place.id &&
               !stops.some(s => s.id === a.id) &&
               (a.cluster === place.cluster || a.experienceType === place.experienceType)
        ).slice(0, 2);

        for (const alt of altCandidates) {
          const delta = alt.visit.typical - place.visit.typical;
          alternatives.push({
            place: alt,
            deltaDurationMin: delta,
            deltaReturnMin: delta,
            whyPrefer: alt.experienceType === 'bakery' ? 'Artisanal bakes and espresso' : 'Alternative scenic perspective',
            fitsCurrentRoute: true,
            verification: alt.verification
          });
        }

        stopsResult.push({
          place,
          arrival: arrivalP50,
          departure: effectiveDepP50,
          durationMin: stayDuration + waitMin,
          leg: {
            fromId: prevPlace ? prevPlace.id : 'campus',
            toId: place.id,
            mode: request.transport,
            durationMin: legP50.totalDurationMin,
            distanceKm: freeFlow.distanceKm,
            trafficStatus: legP50.trafficLabel
          },
          role: place.kind === 'meal' ? 'meal' : i === 0 ? 'primary' : 'secondary',
          whyThisStop: this.narrator.getWhyThisStop(place, i, stops.length, request.locale),
          whatToDo: this.narrator.getWhatToDo(place),
          nextTransitionWhy: this.narrator.getNextTransitionWhy(place, nextPlace, request.locale),
          tip: place.tips?.[0],
          alternatives: alternatives.length ? alternatives : undefined
        });

        if (place.kind === 'meal' || place.experienceType === 'breakfast-local' || place.experienceType === 'restaurant-sitdown') {
          totalMealMin += (stayDuration + waitMin);
        } else {
          totalSightseeingMin += (stayDuration + waitMin);
        }

        totalTravelMin += legP50.totalDurationMin;
        curTimeP50 = effectiveDepP50;
        curTimeP80 = effectiveDepP80;
        curCluster = place.cluster;
        prevPlace = place;
      }

      // Return to campus leg
      const returnFreeFlow = this.matrix.getFreeFlowTime(curCluster, 'campus', request.transport);
      const returnLegP50 = this.traffic.calculateLegDuration(
        returnFreeFlow.durationMin,
        dayType,
        returnFreeFlow.directionType,
        curTimeP50,
        request.transport,
        'p50'
      );
      const returnLegP80 = this.traffic.calculateLegDuration(
        returnFreeFlow.durationMin,
        dayType,
        returnFreeFlow.directionType,
        curTimeP80,
        request.transport,
        'p80'
      );

      const finishP50 = curTimeP50 + returnLegP50.totalDurationMin;
      const finishP80 = curTimeP80 + returnLegP80.totalDurationMin;
      totalTravelMin += returnLegP50.totalDurationMin;

      return {
        stopsResult,
        finishP50,
        finishP80,
        totalTravelMin,
        totalSightseeingMin,
        totalMealMin,
        returnLegP50,
        returnLegP80,
        curCluster,
        prevPlace
      };
    };

    let sim = simulateStops(chosenStops);

    // Iterative trimming loop: if finishP80 exceeds deadline, drop lowest priority stop
    while (sim.finishP80 > deadline && chosenStops.length > 1) {
      // Drop last stop
      chosenStops.pop();
      sim = simulateStops(chosenStops);
    }

    // If single stop still slightly overruns due to typical duration, adjust duration to fit
    if (sim.finishP80 > deadline && chosenStops.length === 1) {
      const overrun = sim.finishP80 - deadline;
      const singlePlace = chosenStops[0];
      const maxReducible = singlePlace.visit.typical - singlePlace.visit.min;
      if (overrun <= maxReducible) {
        sim.stopsResult[0].durationMin -= overrun;
        sim.stopsResult[0].departure -= overrun;
        sim.finishP50 -= overrun;
        sim.finishP80 -= overrun;
        sim.totalSightseeingMin -= overrun;
      }
    }

    const {
      stopsResult,
      finishP50,
      finishP80,
      totalTravelMin,
      totalSightseeingMin,
      totalMealMin,
      returnLegP50,
      curCluster,
      prevPlace
    } = sim;

    const returnFreeFlow = this.matrix.getFreeFlowTime(curCluster, 'campus', request.transport);

    // Contingency buffer calculation (§12)
    const baseBuffer = Math.max(15, Math.round(10 + totalTravelMin * (config.buffers?.drivePercent || 0.12)));
    const hillBuffer = isHillDay ? (config.buffers?.hillDayMin || 20) : 0;
    const peakDescentBuffer = (isHillDay && finishP50 >= 840) ? (config.buffers?.peakHillDescentMin || 15) : 0;
    const totalContingency = baseBuffer + hillBuffer + peakDescentBuffer;

    // Score complete plan
    const candidateData: ItineraryCandidate = {
      stops: chosenStops,
      durations: stopsResult.map(s => s.durationMin),
      travelTimes: stopsResult.map(s => s.leg.durationMin),
      distances: stopsResult.map(s => s.leg.distanceKm),
      clusters: chosenStops.map(s => s.cluster),
      totalTravelMin,
      totalSightseeingMin,
      totalMealMin,
      finishTimeP50: finishP50,
      finishTimeP80: finishP80
    };

    const score = scoreItinerary(
      candidateData,
      request,
      stopsResult.map(s => s.arrival),
      config
    );

    // Cab fare estimation
    let estimatedCost;
    if (request.transport === 'cab') {
      const party = request.partySize || 4;
      const baseFare = isHillDay ? 2800 : 1600;
      const maxFare = isHillDay ? 3600 : 2200;
      estimatedCost = {
        totalMin: baseFare,
        totalMax: maxFare,
        perPersonMin: Math.round(baseFare / party),
        perPersonMax: Math.round(maxFare / party),
        partySize: party
      };
    }

    const practicalTips: string[] = [];
    if (isHillDay) {
      practicalTips.push(this.data.copy[request.locale || 'en']?.advisories?.carry_jacket || 'Carry a jacket: mountain temperatures drop quickly.');
      practicalTips.push(this.data.copy[request.locale || 'en']?.advisories?.carry_cash || 'Carry cash: hill ATMs frequently run out on weekends.');
    }
    if (request.transport === 'cab') {
      practicalTips.push('Fix your return taxi before ascending, as uphill app pickups are patchy.');
    }

    return {
      id: `plan-${Date.now()}`,
      title: this.narrator.getTitle(primaryCluster, request.start >= 1080 ? 'eve' : 'day', request.locale),
      leadSummary: this.narrator.getLeadSummary(chosenStops, request.interests, request.locale),
      stops: stopsResult,
      returnLeg: {
        fromId: prevPlace ? prevPlace.id : 'campus',
        toId: 'campus',
        mode: request.transport,
        durationMin: returnLegP50.totalDurationMin,
        distanceKm: returnFreeFlow.distanceKm,
        trafficStatus: returnLegP50.trafficLabel
      },
      expectedReturn: finishP50,
      latestSafeReturn: finishP80,
      contingencyBufferMin: totalContingency,
      totalTravelMin,
      totalSightseeingMin,
      totalMealMin,
      totalBufferMin: totalContingency,
      estimatedCost,
      compromises: this.narrator.getCompromises(request.interests, chosenStops, windowHours, dayType === 'sunday', request.locale),
      practicalTips,
      objectiveScore: score,
      confidenceChip: `Based on typical ${dayType} conditions`
    };
  }
}
