import type { Place, TripRequest, TimelineStop } from './types.ts';

export class GuideNarrator {
  private copy: any;

  constructor(copyData: any) {
    this.copy = copyData;
  }

  public getTitle(cluster: string, mode: string, locale = 'en'): string {
    const loc = this.copy[locale] || this.copy.en;
    if (mode === 'eve') return loc.titles.night_out || loc.titles.evening_unwind;
    const regionalTitles: Record<string, string> = {
      'mussoorie-outskirts': 'Kempty Falls Day Out',
      dhanaulti: 'Dhanaulti Forest Day Trip',
      chakrata: 'Chakrata & Tiger Falls Expedition',
      'asan-barrage': 'Asan Wetlands Nature Day',
      kalsi: 'Kalsi Heritage Day Trip',
      rishikesh: 'Rishikesh Riverfront Day Out',
      'out-of-scope-default': 'Doon Valley Day Out'
    };
    if (regionalTitles[cluster]) return regionalTitles[cluster];
    if (cluster === 'landour') return loc.titles.landour_morning;
    if (cluster === 'mussoorie-town') return loc.titles.mussoorie_classic;
    if (cluster === 'east-doon') return loc.titles.doon_nature;
    if (cluster === 'clement-town') return loc.titles.culture_clement;
    if (cluster === 'rajpur') return loc.titles.rajpur_cafes;
    return loc.titles.landour_morning;
  }

  public getLeadSummary(stops: Place[], interests: string[], locale = 'en'): string {
    const primary = stops.find(s => s.role === 'primary') || stops[0];
    const isHill = stops.some(s => ['landour', 'mussoorie-town', 'park-estate', 'mussoorie-approach', 'mussoorie-outskirts', 'dhanaulti', 'chakrata'].includes(s.cluster));
    if (stops.length === 1 && ['dhanaulti', 'chakrata', 'asan-barrage', 'kalsi', 'rishikesh', 'mussoorie-outskirts'].includes(primary.cluster)) {
      return `A focused day out to ${primary.name}, planned around your time and the drive back to campus.`;
    }

    if (locale === 'hi') {
      if (isHill) {
        return `आपके समय और प्राथमिकताओं के अनुसार तैयार की गई पहाड़ों की यात्रा। ${primary ? primary.name : 'लैंडौर'} से शुरुआत और समय पर सुरक्षित वापसी।`;
      }
      return `दून घाटी के सबसे बेहतरीन अनुभवों का सुंदर संगम। बिना किसी भागदौड़ के आराम से घूमने का आनंद लें।`;
    }

    if (isHill) {
      return `A refreshing mountain itinerary centered around ${primary ? primary.name : 'Landour'}, balanced with scenic breaks and timed to have you safely back at campus before dusk.`;
    }
    return `A relaxing valley circuit connecting top cultural and nature spots with minimal driving, crafted around your available time and vibes.`;
  }

  public getWhyThisStop(place: Place, i: number, total: number, locale = 'en'): string {
    const loc = this.copy[locale] || this.copy.en;
    if (place.bestTime && i === 0) return loc.reasons.best_time;
    if (place.cluster === 'clement-town') return loc.reasons.scd_nearby;
    if (place.kind === 'meal' || place.experienceType === 'breakfast-local') return loc.reasons.meal_window;
    if (i === total - 1) return loc.reasons.on_the_way_home;
    return loc.reasons.same_cluster;
  }

  public getWhatToDo(place: Place): string[] {
    const actions: string[] = [];
    if (place.tips && place.tips.length) {
      actions.push(...place.tips.slice(0, 2));
    }
    if (actions.length < 2 && place.notes) {
      actions.push(place.notes.split('.')[0] + '.');
    }
    return actions.length ? actions : ['Explore the area and soak in the atmosphere.'];
  }

  public getNextTransitionWhy(current: Place, next: Place | null, locale = 'en'): string {
    const loc = this.copy[locale] || this.copy.en;
    if (!next) return loc.transitions.homeward;
    if (current.cluster === next.cluster) return loc.transitions.adjacent;
    if (next.cluster === 'landour' || next.cluster === 'mussoorie-town') return loc.transitions.scenic_climb;
    return loc.transitions.smooth_descent;
  }

  public getCompromises(
    requestedInterests: string[],
    selectedPlaces: Place[],
    windowHours: number,
    isSunday: boolean,
    locale = 'en'
  ): string[] {
    const loc = this.copy[locale] || this.copy.en;
    const comps: string[] = [];

    const hasGeorge = selectedPlaces.some(p => p.id === 'geo');
    const wantsAdventure = requestedInterests.includes('adventure');
    const isHill = selectedPlaces.some(p => p.cluster === 'landour' || p.cluster === 'mussoorie-town');

    if (!hasGeorge && wantsAdventure && windowHours < 8) {
      comps.push(loc.compromises.george_everest_traffic);
    }

    if (windowHours < 4 && !isHill) {
      comps.push(loc.compromises.mussoorie_time_short);
    }

    if (isHill) {
      comps.push(loc.compromises.single_viewpoint);
    }

    return comps;
  }
}
