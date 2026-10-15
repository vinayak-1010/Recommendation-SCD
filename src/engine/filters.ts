import type { Place, TripRequest, Minutes, DayType } from './types.ts';
import type { DaylightInfo } from './daylight.ts';

export function isPeakAirportHour(minuteOfDay: Minutes): boolean {
  // Peak windows: 5:00-8:00 AM (300-480) or 4:00-7:00 PM (960-1140)
  const m = minuteOfDay % 1440;
  return (m >= 300 && m < 480) || (m >= 960 && m < 1140);
}

export function computeEffectiveReturnDeadline(request: TripRequest, config: any): Minutes {
  if (!request.departure || request.departure.mode === 'none') {
    return request.returnBy;
  }

  const dt = request.departure.at;
  const buffers = config.buffers || {};

  if (request.departure.mode === 'flight') {
    const airportArrivalCandidate = dt - (buffers.flightAirportTravelNormalMin || 120);
    const isPeak = isPeakAirportHour(airportArrivalCandidate);
    const airportTravel = isPeak
      ? (buffers.flightAirportTravelPeakMin || 150)
      : (buffers.flightAirportTravelNormalMin || 120);
    const checkin = buffers.flightCheckinMin || 75;
    const campusExit = buffers.flightCampusExitMin || 20;

    return dt - airportTravel - checkin - campusExit;
  }

  if (request.departure.mode === 'train') {
    const stationTravel = buffers.trainStationTravelMin || 45;
    const stationBuffer = buffers.trainStationBufferMin || 45;
    const campusExit = buffers.trainCampusExitMin || 20;

    return dt - stationTravel - stationBuffer - campusExit;
  }

  return request.returnBy;
}

export function isHillCluster(cluster: string): boolean {
  return cluster === 'landour' || cluster === 'mussoorie-town' || cluster === 'park-estate' || cluster === 'mussoorie-approach';
}

export function filterCandidate(
  place: Place,
  request: TripRequest,
  deadline: Minutes,
  daylight: DaylightInfo
): { allowed: boolean; reason?: string } {
  // 1. Locks: Exclude
  if (request.locks?.exclude?.includes(place.id)) {
    return { allowed: false, reason: 'Manually excluded by user lock' };
  }

  // 2. Transport Suitability
  if (request.transport === 'walk') {
    if (place.cluster !== 'clement-town') {
      return { allowed: false, reason: 'Requires motor vehicle or cab to reach outside Clement Town' };
    }
  }

  // 3. Strenuous and Family Group
  if (place.suitability.strenuous && request.group !== 'friends') {
    return { allowed: false, reason: 'Strenuous physical activity unsuitable for kids/elders' };
  }

  // 4. Two-wheeler hill safety with family
  if (request.transport === 'bike' && request.group !== 'friends' && isHillCluster(place.cluster)) {
    return { allowed: false, reason: 'Two-wheeler mountain trip unsuitable with kids/elders' };
  }

  // 5. Alcohol and nightlife for families
  if (place.alcohol && request.group !== 'friends') {
    return { allowed: false, reason: 'Bar/lounge restricted to 18+ adult solo/friends trips' };
  }

  // 6. Diet filter
  if (request.diet === 'veg' && place.veg === 'nonveg') {
    return { allowed: false, reason: 'Does not offer vegetarian food' };
  }

  // 7. Budget tier
  if (request.budget && place.budget && place.budget > request.budget) {
    return { allowed: false, reason: 'Exceeds selected budget tier' };
  }

  // 8. Daylight Cutoff for Mountain Trips
  if (isHillCluster(place.cluster)) {
    const hillCutoff = request.transport === 'bike' ? daylight.bikeHillCutoff : daylight.carHillCutoff;
    // Earliest departure from campus + minimal transit (60m) + minimal stay (30m) must not exceed cutoff
    if (request.start + 90 > hillCutoff) {
      return { allowed: false, reason: 'Cannot complete mountain visit and descent before dark' };
    }
    if (request.start + 90 > deadline) {
      return { allowed: false, reason: 'Cannot reach mountain destination and return within time budget' };
    }
  }

  // 10. Visit Duration Feasibility
  const minRequiredTime = (place.visit?.min || 30) + 30; // Minimum stay + basic round-trip travel
  const availableWindow = deadline - request.start;
  if (minRequiredTime > availableWindow) {
    return { allowed: false, reason: `Requires at least ${minRequiredTime} minutes, but only ${availableWindow} minutes available` };
  }

  return { allowed: true };
}
