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
    const requestedDeadline = computeEffectiveReturnDeadline(request, config);
    const usableWindowMin = requestedDeadline - request.start;

    if (usableWindowMin <= 0) {
      return null;
    }

    const daylight = calculateDaylight(request.date);
    const dayType = request.dayType || (new Date(request.date).getDay() === 0 ? 'sunday' : new Date(request.date).getDay() === 6 ? 'saturday' : 'weekday');

    // 1. Filter candidates
    const allCandidates = [...this.data.places, ...this.data.eateries];
    const allowed = allCandidates.filter(p => filterCandidate(p, request, requestedDeadline, daylight).allowed);

    const requestedIds = [...new Set(request.locks?.include || [])];
    const requestedPlaces = requestedIds.map(id => allowed.find(place => place.id === id));
    // An explicit destination must remain part of the route. Never silently swap
    // a requested place for an unrelated anchor when it is closed or unreachable.
    if (requestedPlaces.some(place => !place)) return null;
    const lockedStops = requestedPlaces as Place[];

    if (!allowed.length) {
      return null;
    }

    // 2. Derive net budget
    const paceFactor = usableWindowMin <= 90
      ? 0.5
      : request.pace === 'relaxed' ? 1.2 : request.pace === 'packed' ? 0.85 : 1.0;

    const effectiveInterests = request.interests.length > 0
      ? request.interests
      : (usableWindowMin >= 360 ? ['views', 'nature', 'food'] : ['heritage', 'culture', 'food']);

    // 3. Cluster prioritization
    const clusterMap = new Map<string, Place[]>();
    for (const p of allowed) {
      const list = clusterMap.get(p.cluster) || [];
      list.push(p);
      clusterMap.set(p.cluster, list);
    }

    // Determine target primary clusters in preference order
    const clusterScores = Array.from(clusterMap.entries()).map(([cluster, items]) => {
      // Score cluster based on top 2 matches (max-credit) rather than counting every cafe
      const itemScores = items.map(item => {
        let s = 0;
        for (const interest of effectiveInterests) {
          s += (item.affinity?.[interest] || 0);
        }
        return s;
      }).sort((a, b) => b - a);

      let affSum = (itemScores[0] || 0) + 0.5 * (itemScores[1] || 0);

      // Boost mountain clusters for long morning outings with views/nature
      if (isHillCluster(cluster) && (effectiveInterests.includes('views') || effectiveInterests.includes('nature')) && usableWindowMin >= 360 && request.start <= 570) {
        affSum += 1.8;
      }

      // Check distance feasibility with traffic consideration
      const transitTo = this.traffic.calculateLegDuration(
        this.matrix.getFreeFlowTime('campus', cluster, request.transport).durationMin,
        dayType,
        'radial-out',
        request.start,
        request.transport,
        'p50'
      ).totalDurationMin;

      const transitFrom = this.traffic.calculateLegDuration(
        this.matrix.getFreeFlowTime(cluster, 'campus', request.transport).durationMin,
        dayType,
        'radial-in',
        request.start + transitTo + 60,
        request.transport,
        'p50'
      ).totalDurationMin;

      const totalRoundTripTravel = transitTo + transitFrom;
      const minStay = Math.min(...items.map(p => p.visit.min));

      const feasible = usableWindowMin >= (totalRoundTripTravel + minStay);
      // These distant outings need a full-day window from campus
      const fullDayOuting = ['dhanaulti', 'chakrata', 'kalsi', 'rishikesh'].includes(cluster);
      const outingWindowFits = !fullDayOuting || usableWindowMin >= 420;

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
        score: feasible && outingWindowFits ? affSum : -100,
        feasible: feasible && outingWindowFits
      };
    }).sort((a, b) => b.score - a.score);

    const candidateClusters = lockedStops.length
      ? [lockedStops[0].cluster]
      : clusterScores.filter(c => c.feasible).map(c => c.cluster);

    if (!candidateClusters.length) {
      return null;
    }

    // Try candidate clusters in ranking order until a valid itinerary is assembled
    for (const primaryCluster of candidateClusters) {
      const isHillDay = isHillCluster(primaryCluster);
      const hillReturnCutoff = request.transport === 'bike' ? daylight.bikeHillCutoff : daylight.carHillCutoff;
      const deadline = isHillDay ? Math.min(requestedDeadline, hillReturnCutoff) : requestedDeadline;

      // Identify primary anchor candidates in primaryCluster
      const primaryCandidates = (clusterMap.get(primaryCluster) || [])
        .filter(p => p.role === 'primary' || p.role === 'secondary')
        .sort((a, b) => {
          const affA = request.interests.reduce((s, inKey) => s + (a.affinity?.[inKey] || 0), 0);
          const affB = request.interests.reduce((s, inKey) => s + (b.affinity?.[inKey] || 0), 0);
          return affB - affA;
        });

      const anchor = primaryCandidates[0] || (clusterMap.get(primaryCluster) || [])[0] || allowed[0];

      // Build initial chosen stops
      const chosenStops: Place[] = lockedStops.length ? [...lockedStops] : [anchor];
      const anchorDuration = Math.round((chosenStops[0].visit.typical * paceFactor) / 5) * 5;

      // Check if onroute stop (e.g. Maggi) makes sense on hill climb
      const mussoorieCorridor = ['mussoorie-approach', 'mussoorie-town', 'landour', 'park-estate'].includes(primaryCluster);
      if (!lockedStops.length && isHillDay && mussoorieCorridor && usableWindowMin >= 300) {
        const maggi = allowed.find(p => p.id === 'maggi');
        if (maggi && !chosenStops.some(stop => stop.id === maggi.id) &&
            (request.interests.includes('food') || request.interests.includes('views') || !request.interests.length)) {
          chosenStops.unshift(maggi); // Insert on ascent before the mountain summit
        }
      }

      // Check if a secondary stop in the same cluster or adjacent fits
      const remainingBudgetEstimate = usableWindowMin - (anchorDuration + 140);
      if (!lockedStops.length && remainingBudgetEstimate >= 60) {
        // Look for a stroll or secondary experience in same cluster
        const secondary = (clusterMap.get(primaryCluster) || []).find(
          p => p.id !== anchor.id &&
               (p.role === 'secondary' || p.role === 'primary') &&
               p.experienceType !== anchor.experienceType &&
               p.kind !== 'meal'
        );
        if (secondary && !chosenStops.some(s => s.id === secondary.id)) {
          chosenStops.push(secondary);
        }
      }

      // Check if meal window crossed and insert meal stop
      const windowHours = usableWindowMin / 60;
      if (!lockedStops.length && windowHours >= 4.5) {
        // Find meal in primaryCluster or adjacent rajpur / landour on descent
        const mealStop = allowed.find(
          p => (p.kind === 'meal' || p.kind === 'cafe' || p.experienceType === 'breakfast-local' || p.experienceType === 'bakery' || p.experienceType === 'restaurant-sitdown') &&
               !chosenStops.some(s => s.id === p.id) &&
               (p.cluster === primaryCluster || (isHillDay && p.cluster === 'landour') || p.cluster === 'rajpur' || p.cluster === 'city-center')
        );
        if (mealStop) {
          if (mealStop.experienceType === 'breakfast-local') {
            chosenStops.splice(chosenStops.length > 1 ? 1 : 0, 0, mealStop);
          } else {
            chosenStops.push(mealStop);
          }
        }
      }

      // 5. Simulate exact timetable with trimming loop to guarantee P80 return <= deadline
      const simulateStops = (stops: Place[], scaleDurationDown: boolean = false) => {
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
          if (scaleDurationDown || usableWindowMin <= 90) {
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

      // Scale stays if overrunning before dropping
      if (sim.finishP80 > deadline) {
        sim = simulateStops(chosenStops, true);
      }

      // Iterative trimming loop: if finishP80 exceeds deadline, drop lowest priority stop
      while (sim.finishP80 > deadline && chosenStops.length > 1) {
        chosenStops.pop();
        sim = simulateStops(chosenStops, true);
      }

      // Greedy expansion loop: if ample comfortable daylight and window remains, add compatible subsequent stops
      if (!lockedStops.length && deadline - sim.finishP80 >= 75 && chosenStops.length < 4) {
        const allowedAdditions = allowed.filter(cand => {
          if (chosenStops.some(s => s.id === cand.id)) return false;
          if (cand.id === 'bha') return false; // Bhadraj is too strenuous for multi-stop
          const matchesCluster = isHillDay
            ? (cand.cluster === primaryCluster || cand.cluster === 'landour' || cand.cluster === 'mussoorie-town')
            : (cand.cluster === primaryCluster || cand.cluster === 'city-center' || cand.cluster === 'east-doon' || cand.cluster === 'rajpur');
          if (!matchesCluster) return false;
          const hasViewpoint = chosenStops.some(s => s.experienceType === 'viewpoint');
          if (hasViewpoint && cand.experienceType === 'viewpoint') return false;
          if (chosenStops.some(s => s.experienceType === cand.experienceType)) return false;
          const isMeal = cand.kind === 'meal' || cand.kind === 'cafe' || cand.experienceType === 'bakery' || cand.experienceType === 'breakfast-local' || cand.experienceType === 'restaurant-sitdown';
          const hasMeal = chosenStops.some(s => s.kind === 'meal' || s.kind === 'cafe' || s.experienceType === 'bakery' || s.experienceType === 'breakfast-local' || s.experienceType === 'restaurant-sitdown');
          if (isMeal && hasMeal && chosenStops.length >= 2) return false;
          return true;
        }).sort((a, b) => {
          const affA = effectiveInterests.reduce((s, inKey) => s + (a.affinity?.[inKey] || 0), 0);
          const affB = effectiveInterests.reduce((s, inKey) => s + (b.affinity?.[inKey] || 0), 0);
          return affB - affA;
        });

        for (const cand of allowedAdditions) {
          if (chosenStops.length >= 4) break;
          const testChosen = [...chosenStops, cand];
          const testSim = simulateStops(testChosen);
          if (testSim.finishP80 <= deadline) {
            chosenStops.push(cand);
            sim = testSim;
          }
        }
      }

      // If single stop still slightly overruns, adjust duration
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

      // If this cluster still exceeds deadline, try next cluster!
      if (sim.finishP80 > deadline) {
        continue;
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

      // Contingency buffer calculation
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

      // Dynamic cost estimation for all transit modes with partySize support
      const party = request.partySize || 4;
      let baseFare = 0;
      let maxFare = 0;
      if (request.transport === 'bike') {
        const bikesNeeded = Math.ceil(party / 2);
        baseFare = bikesNeeded * 600;
        maxFare = bikesNeeded * 900;
      } else if (request.transport === 'walk' || request.transport === 'public') {
        baseFare = party * 150;
        maxFare = party * 350;
      } else {
        // car / cab
        if (party <= 4) {
          baseFare = isHillDay ? 2800 : 1800;
          maxFare = isHillDay ? 3600 : 2400;
        } else if (party <= 7) {
          baseFare = isHillDay ? 4200 : 2800;
          maxFare = isHillDay ? 5200 : 3600;
        } else {
          // 8+ tempo traveller
          baseFare = isHillDay ? 6500 : 4500;
          maxFare = isHillDay ? 8000 : 5800;
        }
      }

      const estimatedCost = {
        totalMin: baseFare,
        totalMax: maxFare,
        perPersonMin: Math.max(50, Math.round(baseFare / party)),
        perPersonMax: Math.max(100, Math.round(maxFare / party)),
        partySize: party
      };

      const practicalTips: string[] = [];
      if (isHillDay) {
        practicalTips.push(this.data.copy[request.locale || 'en']?.advisories?.carry_jacket || 'Carry a jacket: mountain temperatures drop quickly.');
        practicalTips.push(this.data.copy[request.locale || 'en']?.advisories?.carry_cash || 'Carry cash: hill ATMs frequently run out on weekends.');
      }
      if (request.transport === 'cab' || request.transport === 'car') {
        practicalTips.push('Fix your return taxi before ascending, as uphill app pickups are patchy.');
      }
      if (party >= 5) {
        practicalTips.push(`Traveling with ${party} people: Allow +15 mins buffer at parking bays; 7-seater SUV or Tempo Traveller recommended.`);
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

    return null;
  }
}
