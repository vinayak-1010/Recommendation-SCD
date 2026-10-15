/**
 * OPEN-METEO WEATHER INTEGRATION (Zero API Key Needed)
 * Provides real-time valley & mountain weather with packing advice
 */

export interface WeatherTelemetry {
  valleyTemp: number;
  ridgeTemp: number;
  sunsetTime: string;
  sunriseTime: string;
  isRaining: boolean;
  packingAdvice: string;
  source: 'live' | 'offline-cache';
}

export async function fetchLiveWeather(): Promise<WeatherTelemetry> {
  const fallback: WeatherTelemetry = {
    valleyTemp: 24,
    ridgeTemp: 18,
    sunsetTime: '5:34 PM',
    sunriseTime: '6:32 AM',
    isRaining: false,
    packingAdvice: 'Mild valley days (24°C). Carry a fleece or light down jacket for Landour ridge (18°C / drops to 12°C at dusk).',
    source: 'offline-cache'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const [valleyRes, ridgeRes] = await Promise.all([
      fetch('https://api.open-meteo.com/v1/forecast?latitude=30.2705&longitude=77.9965&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Asia%2FKolkata', { signal: controller.signal }),
      fetch('https://api.open-meteo.com/v1/forecast?latitude=30.4635&longitude=78.0988&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Asia%2FKolkata', { signal: controller.signal })
    ]);

    clearTimeout(timeoutId);

    if (!valleyRes.ok || !ridgeRes.ok) return fallback;

    const valleyData = await valleyRes.json();
    const ridgeData = await ridgeRes.json();

    const valleyTemp = Math.round(valleyData.current?.temperature_2m ?? 24);
    const ridgeTemp = Math.round(ridgeData.current?.temperature_2m ?? 18);
    const rawSunset = valleyData.daily?.sunset?.[0]; // e.g. "2026-10-31T17:34"
    let sunsetTime = '5:34 PM';
    if (rawSunset) {
      const d = new Date(rawSunset);
      sunsetTime = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const weatherCode = valleyData.current?.weather_code || 0;
    const isRaining = weatherCode >= 51 && weatherCode <= 67;

    let packingAdvice = `Comfortable valley temperature (${valleyTemp}°C). A light jacket is essential for the Mussoorie ridge (${ridgeTemp}°C).`;
    if (ridgeTemp < 15) {
      packingAdvice = `Cold winds on the ridge (${ridgeTemp}°C). Pack warm layers, gloves, and windbreaker.`;
    }
    if (isRaining) {
      packingAdvice = `Light showers reported in Shivalik range. Carry an umbrella and wear water-resistant shoes.`;
    }

    return {
      valleyTemp,
      ridgeTemp,
      sunsetTime,
      sunriseTime: '6:32 AM',
      isRaining,
      packingAdvice,
      source: 'live'
    };
  } catch (err) {
    return fallback;
  }
}
