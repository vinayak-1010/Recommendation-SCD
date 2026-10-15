import type { Minutes } from './types.ts';

export interface DaylightInfo {
  sunrise: Minutes;
  sunset: Minutes;
  carHillCutoff: Minutes;
  bikeHillCutoff: Minutes;
}

/**
 * Standard astronomical solar calculation based on NOAA solar calculations.
 * Computes official sunrise and sunset for Dehradun / Mussoorie (lat 30.32, lng 78.03).
 */
export function calculateDaylight(dateStr: string, lat = 30.32, lng = 78.03): DaylightInfo {
  const d = new Date(dateStr + 'T12:00:00Z');
  // Day of year
  const startOfYear = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Fractional year in radians
  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1);

  // Equation of time in minutes
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(gamma) -
    0.032077 * Math.sin(gamma) -
    0.014615 * Math.cos(2 * gamma) -
    0.040849 * Math.sin(2 * gamma)
  );

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  const latRad = lat * (Math.PI / 180);
  const zenithRad = 90.833 * (Math.PI / 180); // Official zenith with atmospheric refraction

  // Hour angle
  const cosH = (Math.cos(zenithRad) / (Math.cos(latRad) * Math.cos(decl))) - (Math.tan(latRad) * Math.tan(decl));
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const haRad = Math.acos(clampedCosH);
  const haDeg = haRad * (180 / Math.PI);

  // India is UTC+5:30 (timezone offset +330 min)
  const tzOffset = 330;
  const solarNoon = 720 - 4 * lng - eqtime + tzOffset;

  const sunrise = Math.round(solarNoon - 4 * haDeg);
  const sunset = Math.round(solarNoon + 4 * haDeg);

  return {
    sunrise,
    sunset,
    carHillCutoff: sunset - 30, // Off mountain 30m before dark
    bikeHillCutoff: sunset - 45 // Two-wheeler off mountain 45m before dark
  };
}
