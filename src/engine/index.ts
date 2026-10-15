import placesData from '../../data/places.json' with { type: 'json' };
import eateriesData from '../../data/eateries.json' with { type: 'json' };
import routesData from '../../data/routes.json' with { type: 'json' };
import trafficData from '../../data/traffic.json' with { type: 'json' };
import rulesData from '../../data/rules.json' with { type: 'json' };
import copyData from '../../data/copy.json' with { type: 'json' };
import configData from '../../data/config.json' with { type: 'json' };

import type { TripRequest, Itinerary, Place } from './types.ts';
import { ItineraryAssembler, type EngineDatasets } from './assembler.ts';
import { ReplanEngine } from './replan.ts';
import { calculateDaylight } from './daylight.ts';

export * from './types.ts';
export * from './daylight.ts';
export * from './matrix.ts';
export * from './traffic.ts';
export * from './filters.ts';
export * from './scorer.ts';
export * from './assembler.ts';
export * from './narration.ts';
export * from './replan.ts';

let defaultDatasets: EngineDatasets | null = null;

export function loadDefaultDatasets(): EngineDatasets {
  if (defaultDatasets) return defaultDatasets;

  defaultDatasets = {
    places: placesData as any,
    eateries: eateriesData as any,
    routes: routesData as any,
    traffic: trafficData as any,
    rules: rulesData as any,
    copy: copyData as any,
    config: configData as any
  };

  return defaultDatasets;
}

export function planTrip(request: TripRequest, datasets?: EngineDatasets): Itinerary | null {
  const data = datasets || loadDefaultDatasets();
  const assembler = new ItineraryAssembler(data);
  return assembler.assemble(request);
}
