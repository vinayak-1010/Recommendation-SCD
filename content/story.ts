/**
 * EDITABLE STORY & EDITORIAL CONTENT
 * AWS Student Community Day 2026 · Graphic Era (Deemed to be University)
 *
 * Edit this file to update the motto, story narrative, or section copy.
 */

export interface StoryChapter {
  id: string;
  num: string;
  shortTitle: string;
  chapterTag: string;
  quote: string;
  prose: string;
  image: string;
  altitude: string;
  timeTag: string;
  metricDistance: string;
  metricDuration: string;
  metricVibe: string;
  actionText: string;
  actionTarget: string;
}

export const EVENT_META = {
  name: 'AWS Student Community Day 2026',
  host: 'Graphic Era (Deemed to be University)',
  location: 'Clement Town, Dehradun, Uttarakhand',
  dates: 'October 31 – November 1, 2026',
  audience: 'Invited Speakers, Cloud Builders & National Delegates',
  tagline: 'Come for the code. Stay for the mountains.',
  closingMotto: 'Build in the cloud. Wander in the clouds.'
};

export const THE_WHY = {
  eyebrow: 'OUR MOTTO · THE STORY OF US',
  heading: 'Why We Built This For You',
  paragraphWords: [
    'We', 'are', 'students', 'who', 'build', 'in', 'the', 'cloud,',
    'but', 'we', 'grew', 'up', 'under', 'these', 'hills.',
    'Our', 'speakers', 'and', 'guests', 'travel', 'far', 'from', 'across', 'India',
    'to', 'share', 'what', 'they', 'know.',
    'This', 'is', 'our', 'way', 'of', 'showing', 'them', 'where', 'we', 'come', 'from—',
    'with', 'zero', 'backtracking,', 'mountain', 'daylight', 'safety,', 'and', 'true', 'local', 'heart.'
  ]
};

export const THE_PROMISE = [
  {
    num: '01',
    headline: 'No backtracking.',
    sub: 'Graph-computed single-direction loops. Every route flows continuously so you never waste precious weekend hours stuck in Doon or Rajpur choke points.',
    icon: 'one-way'
  },
  {
    num: '02',
    headline: 'Home before dark.',
    sub: 'Real astronomical sunset calculations. Hill descents are hard-capped to return you before mountain fog rolls over the hairpin bends.',
    icon: 'sun-arc'
  },
  {
    num: '03',
    headline: 'Local, not touristy.',
    sub: 'Curated by students who live here. 1953 colonial bakeries, roadside cheese Maggi overlooking twilight valleys, and secluded monastery gardens.',
    icon: 'local-pin'
  }
];

export const THREE_WORLDS = [
  {
    id: 'valley',
    zone: 'The Valley',
    sub: 'Dehradun & Foothills',
    accentColor: '#1E51EC',
    altitude: '640m – 800m',
    distance: '0 km – 14 km from GEU',
    image: 'fri.jpg',
    lead: 'Colonial Greco-Roman brick colonnades, 60-meter Tibetan stupas, limestone river canyon wading, and vibrant street markets.',
    spotsCount: '12 Spots',
    targetHash: '#/heritage'
  },
  {
    id: 'hills',
    zone: 'The Hills',
    sub: 'Mussoorie & Landour Ridge',
    accentColor: '#AD5CFF',
    altitude: '1,350m – 2,290m',
    distance: '24 km – 36 km from GEU',
    image: 'land.jpg',
    lead: 'Misty pine and deodar forests, Ruskin Bond\'s literary trails, 19th-century bakeries, and the legendary snow panorama from Lal Tibba summit.',
    spotsCount: '14 Spots',
    targetHash: '#/mountains'
  },
  {
    id: 'river',
    zone: 'The River & Beyond',
    sub: 'Rishikesh, Haridwar & Outskirts',
    accentColor: '#FF9900',
    altitude: '340m – 2,400m',
    distance: '42 km – 85 km from GEU',
    image: 'rish.jpg',
    lead: 'Twilight Ganga Aarti with floating oil lamps, suspension bridges, white water rapids, ancient Ashokan rock edicts, and apple orchards.',
    spotsCount: '11 Spots',
    targetHash: '#/directory'
  }
];

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'campus',
    num: '01',
    shortTitle: '01 The Arrival',
    chapterTag: 'PROLOGUE · GRAPHIC ERA UNIVERSITY',
    quote: 'Where 1,500 builders gather beneath the Shivalik hills to architect the future.',
    prose: 'You step into Clement Town. Bell Road hums with developers, students, and AWS heroes. Keynotes, system designs, and hackathons are just the opening chapter. Waiting right outside the gates is the wild beauty of Uttarakhand.',
    image: 'mind.jpg',
    altitude: '650m (Valley Base)',
    timeTag: 'Campus 0.0 km',
    metricDistance: '0.0 km from GEU',
    metricDuration: 'All Weekend',
    metricVibe: 'Conference & Cloud Tech',
    actionText: 'Begin Chapter 2 →',
    actionTarget: 'next'
  },
  {
    id: 'stupa',
    num: '02',
    shortTitle: '02 Monastic Calm',
    chapterTag: 'CHAPTER 1 · CLEMENT TOWN MONASTERY',
    quote: 'Step five minutes outside the conference gates, and the world goes completely quiet.',
    prose: 'A short morning walk brings you beneath the 60-meter Great Stupa of Mindrolling Monastery. Monks in saffron robes chant in golden prayer halls, copper prayer wheels spin softly, and the air smells of juniper incense and pine.',
    image: 'mind.jpg',
    altitude: '650m (Valley Floor)',
    timeTag: '5 Min Walk',
    metricDistance: '1.2 km from GEU',
    metricDuration: '45–60 mins',
    metricVibe: 'Peace & Tibetan Murals',
    actionText: 'Explore Valley Sanctuaries →',
    actionTarget: '#/heritage'
  },
  {
    id: 'ghats',
    num: '03',
    shortTitle: '03 The Winding Ghats',
    chapterTag: 'CHAPTER 2 · SHIVALIK HIGHWAY ASCENT',
    quote: 'The temperature drops six degrees. The mist rolls in. The first bite of hill Maggi.',
    prose: 'As your cab carves through the winding mountain turns, the warmth of the plains dissolves into crisp pine breeze. Roadside shacks cling to cliffsides, serving steaming bowls of cheese Maggi and adrak chai overlooking the vast Doon valley below.',
    image: 'maggi.jpg',
    altitude: '1,350m (Ghats)',
    timeTag: 'Ascent Pitstop',
    metricDistance: '18 km from GEU',
    metricDuration: '25 mins break',
    metricVibe: 'Chai & Valley Overlook',
    actionText: 'Plan Ascent Route →',
    actionTarget: '#/planner'
  },
  {
    id: 'landour',
    num: '04',
    shortTitle: '04 Landour Summit',
    chapterTag: 'CHAPTER 3 · 2,290M ALPINE RIDGE',
    quote: 'Where 19th-century colonial tin roofs meet deodar forests and snow-capped peaks.',
    prose: 'At the very crown of the ridge sits Landour. Walk Sisters\' Bazaar under towering deodars past Ruskin Bond\'s favorite haunts to Lal Tibba. High-powered binoculars reveal the luminous snow ridges of Bandarpoonch and Kedarnath against deep azure skies.',
    image: 'land.jpg',
    altitude: '2,290m (Summit)',
    timeTag: 'Snow Peak View',
    metricDistance: '34 km from GEU',
    metricDuration: '2–3 hours',
    metricVibe: 'Pines, Snow Peaks & Bakeries',
    actionText: 'Explore 8 Mountain Peaks →',
    actionTarget: '#/mountains'
  },
  {
    id: 'winterline',
    num: '05',
    shortTitle: '05 The Winterline',
    chapterTag: 'CHAPTER 4 · SIR GEORGE EVEREST CLIFF',
    quote: 'An optical phenomenon found in only two places on Earth: the Swiss Alps, and right here.',
    prose: 'At twilight, hike the cliff ridge trail to Sir George Everest\'s restored 1832 estate. As the sun sinks behind the Shivalik contours, the horizon ignites into a razor-straight glowing line of violet, gold, and vermilion: the legendary Himalayan Winterline.',
    image: 'geo.webp',
    altitude: '2,050m (Cliff Peak)',
    timeTag: 'Sunset 5:34 PM',
    metricDistance: '31 km from GEU',
    metricDuration: '1.5 hours',
    metricVibe: 'Golden Hour Magic',
    actionText: 'Plan Sunset Itinerary →',
    actionTarget: '#/planner'
  },
  {
    id: 'rajpur',
    num: '06',
    shortTitle: '06 Midnight Bites',
    chapterTag: 'EPILOGUE · RAJPUR ROAD NIGHT CRAWL',
    quote: 'Descend into the glowing neon spine of the valley for hot momos and craft brews.',
    prose: 'Follow daylight-safe roads back to the city for Dehradun\'s famous late-night gastronomy. Crispy chicken kothay momos at Kalsang, legendary 1953 stick jaws at Ellora\'s, and a craft beer toast to AWS Community Day under the starlit sky at The Brew Estate.',
    image: 'kfc.jpg',
    altitude: '750m (Rajpur Road)',
    timeTag: 'Dinner & Twilight',
    metricDistance: '14 km from GEU',
    metricDuration: 'Evening crawl',
    metricVibe: 'Momos, Cocktails & Lounges',
    actionText: 'Explore Food & Nightlife →',
    actionTarget: '#/food'
  }
];
