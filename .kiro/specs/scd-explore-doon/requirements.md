# Requirements Document

## Introduction

Explore Doon is a single self-contained HTML page (`scd-explore-doon.html`) that recommends a Sunday itinerary (daytime sightseeing or evening/nightlife) for guests of AWS Student Community Day 2026 ("The Highland Edition") at Graphic Era, Clement Town, Dehradun. It will be embedded via `<iframe>` into the official event page (`awssbggeu.com/student-community-day`). The page must remain phone-first, use only the official AWS SBG GEU UI tokens, never fabricate venue facts (unverified data is shown with "Unverified"/"Check hours" pills instead), and stay a single file with no build step.

This document captures both the existing baseline behavior of the page (so the spec reflects the whole feature) and the pending changes the owner, Vinayak Singh, has already identified but not yet applied. Where the owner has not yet supplied verified data (e.g. Readers Coffee House hours, the "koi" venue), this document records that as an open question rather than inventing details.

## Glossary

- **Explore_Doon_Page**: The complete `scd-explore-doon.html` document, including markup, styles, and script.
- **Control_Panel**: The input region (`#g-md`, `#g-in`, fine-tune `<details>`) where the guest selects mode, vibes, and preferences.
- **Output_Panel**: The `#out` region where the generated plan, warnings, and suggestion rails are rendered.
- **Recommendation_Engine**: The scripted logic that filters, scores, and assembles candidate stops into a plan (the `run()` and `eve()` functions and their helpers).
- **Place_Catalog**: The data table `D` of daytime sightseeing/trek destinations.
- **Eatery_Catalog**: The data table `E` of cafés, restaurants, bars, and clubs.
- **Itinerary_Builder**: The part of the Recommendation_Engine that orders, times, and trims selected stops into a single back-to-back timeline (`sim`, `ord`, and the trimming loop in `run()`).
- **Directions_Panel**: The collapsible "How to get there" `<details>` element attached to a stop, listing ordered travel steps.
- **Summary_Tiles**: The three-tile bar (Usable time / Return-by or Free-until / Sunset) shown above the itinerary.
- **Unverified_Badge**: A pill ("Unverified" or "Check hours") shown on a Place_Catalog or Eatery_Catalog entry whose data has not been confirmed from an authoritative source.
- **Tuned_State**: A boolean condition that becomes true once the guest changes any fine-tune control (start time, departure mode, departure/back-by time, travel mode, group, or pace) away from its default value.
- **Return_Deadline**: The computed time by which the guest must be back at the Graphic Era campus, derived from departure mode and departure time (day mode) or from the back-by time entered directly (evening mode).
- **Daylight_Cutoff**: The latest clock time (5:00 PM / minute 1020) by which a Mountain_Trip stop must be finished, independent of the Return_Deadline.
- **Mountain_Trip**: A Place_Catalog entry flagged `mt:1` (a Mussoorie-road destination subject to the Daylight_Cutoff and hill-road travel rules).
- **Full_Day_Trip**: A Place_Catalog entry flagged `full:1`, intended to occupy the entire usable window on its own and never be combined with other sightseeing stops.
- **Peak_Window**: Either of two time ranges (5:00–8:00 AM, minute 300–480; or 4:00–7:00 PM, minute 960–1140) during which airport travel time is assumed to be longer.
- **Group_Type**: The selected travelling party — "Friends / solo" (`fr`), "With kids" (`kid`), or "With elders" (`eld`).
- **Travel_Mode**: The selected way of getting around — "Car / cab" (`car`), "Two-wheeler" (`bike`), or "Auto / walk" (`none`).
- **Embed_Host**: The parent web page that embeds the Explore_Doon_Page inside an `<iframe>`.

## Requirements

### Requirement 1: Mode Selection

**User Story:** As a guest, I want to choose between a daytime plan and an evening/nightlife plan, so that I get a recommendation that matches the part of the day I am planning for.

#### Acceptance Criteria

1. THE Explore_Doon_Page SHALL offer exactly two mode options: "Sunday day" and "Evening & night".
2. WHEN the guest selects "Evening & night", THE Explore_Doon_Page SHALL set the departure mode to "No fixed trip", set the start-from-campus time to 6:00 PM, and set the back-by time to 11:00 PM.
3. WHEN the guest selects "Sunday day", THE Explore_Doon_Page SHALL set the start-from-campus time to 8:00 AM and the free-until time to 5:00 PM.
4. WHEN the guest selects "Evening & night", THE Control_Panel SHALL hide the departure-mode field.
5. WHEN the guest selects the "Night out" vibe while mode is "Sunday day", THE Explore_Doon_Page SHALL switch mode to "Evening & night" and apply the Evening & night defaults.

### Requirement 2: Vibe Selection

**User Story:** As a guest, I want to tap one or more interest tags, so that the recommendation favors places that match what I enjoy.

#### Acceptance Criteria

1. THE Control_Panel SHALL present the vibe options: Spiritual, Nature, Food & cafés, Adventure, Views, and Night out, each as an independently toggleable checkbox.
2. THE Explore_Doon_Page SHALL allow zero, one, or multiple vibes to be selected at the same time.
3. WHEN the guest changes any vibe selection, THE Recommendation_Engine SHALL recompute and redisplay the plan within the Output_Panel.

### Requirement 3: Fine-Tune Controls

**User Story:** As a guest, I want to optionally adjust timing, travel mode, group, and pace, so that the plan reflects my actual trip constraints.

#### Acceptance Criteria

1. WHERE the guest expands "Fine-tune (optional)", THE Control_Panel SHALL display controls for start-from-campus time, departure mode, departure/free-until/back-by time, Travel_Mode, Group_Type, and Pace.
2. THE Control_Panel SHALL default Travel_Mode to "Car / cab", Group_Type to "Friends / solo", and Pace to "Relaxed".
3. WHEN the guest changes the departure mode to "Flight" or "Train", THE Control_Panel SHALL relabel the time field as "Flight departs at" or "Train departs at" respectively and set its default value to 8:00 PM.
4. WHEN the guest changes the departure mode to "No fixed trip", THE Control_Panel SHALL relabel the time field as "Free until" and set its default value to 5:00 PM.
5. WHEN the guest changes any fine-tune control value away from its default, THE Explore_Doon_Page SHALL set Tuned_State to true.

### Requirement 4: Day-Mode Hard Filters

**User Story:** As a guest, I want implausible or unsafe destinations automatically excluded, so that I only see plans that are actually feasible for my trip.

#### Acceptance Criteria

1. IF Travel_Mode is "Auto / walk" (`none`), THEN THE Recommendation_Engine SHALL exclude every Mountain_Trip Place_Catalog entry from consideration.
2. IF a Place_Catalog entry is flagged `far:1` and (Travel_Mode is "Auto / walk" OR the departure mode is not "No fixed trip"), THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
3. IF a Place_Catalog entry has physical-difficulty level `ph:2` and Group_Type is not "Friends / solo", THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
4. IF a Place_Catalog entry is a Mountain_Trip or `far:1` entry and Travel_Mode is "Two-wheeler" and Group_Type is not "Friends / solo", THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
5. IF the start-from-campus time plus the entry's round-trip travel time and planned stay duration exceeds the usable window, THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
6. IF a Mountain_Trip entry's arrival time plus 30 minutes exceeds the Return_Deadline, THEN THE Recommendation_Engine SHALL exclude that entry from consideration, evaluated against the lesser of the Return_Deadline and the Daylight_Cutoff.
7. IF a Place_Catalog entry has a published closing time and the start-from-campus time plus travel time plus 30 minutes exceeds that closing time, THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
8. IF a Place_Catalog entry's expected wait for opening exceeds 120 minutes, THEN THE Recommendation_Engine SHALL exclude that entry from consideration.
9. THE Recommendation_Engine SHALL exclude on-route-only entries (such as the Mussoorie Road Maggi stop) from the primary candidate list and SHALL only ever insert them as a travel-leg addition per Requirement 7.

### Requirement 5: Day-Mode Scoring Model

**User Story:** As a guest, I want the surviving candidate destinations ranked, so that the plan picks the stops that best fit my vibes and constraints.

#### Acceptance Criteria

1. FOR each Place_Catalog entry that survives the Requirement 4 filters, THE Recommendation_Engine SHALL compute a score as a weighted combination of: vibe-match ratio against the guest's selected vibes, time-budget fit, Travel_Mode suitability, Group_Type suitability, a fixed local-expert weight, time-of-day suitability, a daylight/overrun risk penalty for Mountain_Trip entries, a time-budget-overrun penalty, and an opening-wait penalty.
2. THE Recommendation_Engine SHALL clamp every computed score to a minimum of zero.
3. THE Recommendation_Engine SHALL sort surviving candidates by score in descending order before itinerary assembly.

### Requirement 6: Day-Mode Itinerary Assembly

**User Story:** As a guest, I want a single back-to-back plan for my day, so that I know exactly what to do and when, without manually sequencing stops myself.

#### Acceptance Criteria

1. WHEN assembling the day plan, THE Itinerary_Builder SHALL select at most one Mountain_Trip or Full_Day_Trip entry, preferring one without an Unverified_Badge if available.
2. IF the selected entry is a Full_Day_Trip, THEN THE Itinerary_Builder SHALL NOT add any further sightseeing stop to the plan.
3. WHILE no Mountain_Trip or Full_Day_Trip entry is selected or the selected one is not a Full_Day_Trip, THE Itinerary_Builder SHALL add up to three additional highest-scoring, non-on-route, non-Unverified-exempt candidate stops.
4. THE Itinerary_Builder SHALL order the assembled stops with any Mountain_Trip or Full_Day_Trip entry first, the on-route Maggi stop next if present, then remaining stops by published opening time.
5. THE Itinerary_Builder SHALL compute each stop's arrival time as the previous stop's departure time plus the travel-leg duration, and SHALL add any wait for that stop's opening time before starting the stay duration.
6. WHILE the simulated finish time exceeds the Return_Deadline (or the Daylight_Cutoff when a Mountain_Trip stop is included) and more than one stop remains, THE Itinerary_Builder SHALL drop the lowest-scoring droppable stop and re-simulate the timeline.
7. IF no combination of stops finishes within the Return_Deadline, THEN THE Output_Panel SHALL display a notice that no complete plan fits and SHALL show the best single-stop options instead.
8. WHEN a complete plan is produced, THE Output_Panel SHALL display each stop with its arrival and departure time, the travel-leg duration and mode-specific travel time to reach it, and the return-to-campus leg with its duration and arrival time.

### Requirement 7: On-Route Maggi Stop Inclusion

**User Story:** As a guest, I want the roadside Maggi/tea stop automatically included on hill-road trips, so that I get a realistic break on the way up or down even if I did not explicitly ask for food.

#### Acceptance Criteria

1. WHEN the assembled plan includes a Mountain_Trip entry, Travel_Mode is not "Auto / walk", and no vibe is selected, THE Itinerary_Builder SHALL include the on-route Maggi stop in the plan.
2. WHEN the assembled plan includes a Mountain_Trip entry, Travel_Mode is not "Auto / walk", and at least one selected vibe matches a tag of the on-route Maggi stop, THE Itinerary_Builder SHALL include the on-route Maggi stop in the plan.
3. THE Itinerary_Builder SHALL evaluate the "no vibe selected" condition in acceptance criterion 1 as its own inclusion rule, independent of and not short-circuited by the vibe-match evaluation in acceptance criterion 2.

### Requirement 8: Lunch Stop Addition on Long Trips

**User Story:** As a guest, I want a food stop added automatically on long outings, so that I am not left without a meal plan on a multi-hour day.

#### Acceptance Criteria

1. WHEN the usable time window is 300 minutes or more and the selected Mountain_Trip or Full_Day_Trip entry (if any) is not a Full_Day_Trip, THE Itinerary_Builder SHALL add one food or café candidate as a lunch stop to the plan before trimming.
2. THE Itinerary_Builder SHALL make the lunch stop eligible for the same trimming rule described in Requirement 6, acceptance criterion 6.

### Requirement 9: Return Deadline Calculation Without a Fixed Departure or by Train

**User Story:** As a guest without a fixed onward trip, I want the system to use my stated free-until time directly, so that the plan respects the time I actually have.

#### Acceptance Criteria

1. WHEN the departure mode is "No fixed trip", THE Recommendation_Engine SHALL set the Return_Deadline equal to the entered free-until time.
2. WHEN the departure mode is "Train", THE Recommendation_Engine SHALL set the Return_Deadline to the entered train departure time minus 45 minutes of travel to the station, minus 45 minutes of station buffer, minus 20 minutes of campus-exit buffer.

### Requirement 10: Return Deadline Calculation for Flight Departures

**User Story:** As a guest with a flight to catch, I want the back-by time to account for airport travel and check-in realistically, so that I do not risk missing my flight.

#### Acceptance Criteria

1. WHEN the departure mode is "Flight", THE Recommendation_Engine SHALL compute the airport-arrival time as the entered flight departure time minus 120 minutes.
2. THE Recommendation_Engine SHALL evaluate whether the airport-arrival time (not the flight departure time) falls within a Peak_Window.
3. WHEN the airport-arrival time falls within a Peak_Window, THE Recommendation_Engine SHALL set the Return_Deadline to the flight departure time minus 150 minutes of airport travel, minus 75 minutes of check-in/security buffer, minus 20 minutes of campus-exit buffer.
4. WHEN the airport-arrival time does not fall within a Peak_Window, THE Recommendation_Engine SHALL set the Return_Deadline to the flight departure time minus 120 minutes of airport travel, minus 75 minutes of check-in/security buffer, minus 20 minutes of campus-exit buffer.
5. FOR the example of a flight departing at 8:00 PM, THE Recommendation_Engine SHALL produce a Return_Deadline of 3:55 PM, since the computed airport-arrival time of 6:00 PM falls within the 4:00–7:00 PM Peak_Window.

### Requirement 11: Daylight Constraint for Mountain Trips

**User Story:** As a guest heading into the hills, I want to be warned about sunset timing, so that I am not caught on a mountain road or trail after dark.

#### Acceptance Criteria

1. THE Recommendation_Engine SHALL treat 5:00 PM (minute 1020) as the Daylight_Cutoff for finishing any Mountain_Trip stop.
2. WHEN the assembled plan includes a Mountain_Trip stop, THE Output_Panel SHALL display a notice stating that sunset is about 5:30 PM and that the plan targets being off the mountain by 5:00 PM.
3. WHEN the Landour stop is included and its departure time is after 10:30 AM, THE Output_Panel SHALL display the stop's tip to leave Landour before about 10:00 AM due to rising Sunday traffic.

### Requirement 12: Group-Based Exclusions

**User Story:** As a guest travelling with kids or elders, I want strenuous or unsuitable stops left out, so that the plan fits everyone in my group.

#### Acceptance Criteria

1. IF Group_Type is "With kids" or "With elders", THEN THE Recommendation_Engine SHALL exclude every Place_Catalog entry with physical-difficulty level `ph:2`.
2. IF Group_Type is not "Friends / solo", THEN THE Recommendation_Engine SHALL exclude bar and club Eatery_Catalog entries from both the plan and the suggestion rail.
3. IF Group_Type is "With kids" or "With elders" and the selected vibes include "Night out", THEN THE Output_Panel SHALL display a notice that bars and clubs were left out for family groups and that cafés and dinner were planned instead.

### Requirement 13: Travel-Mode-Based Exclusions and Guidance

**User Story:** As a guest without my own vehicle, I want the plan to account for needing a cab or ride app, so that I am not stranded at a remote stop.

#### Acceptance Criteria

1. IF Travel_Mode is "Auto / walk" and a non-walking stop is included in the plan, THEN THE Directions_Panel for that stop SHALL include guidance to book a cab for that leg and to fix the return ride before leaving, noting that ride apps run until about midnight but hill pickups are less reliable.
2. IF Travel_Mode is "Two-wheeler" and the plan includes a Mountain_Trip stop, THEN THE Directions_Panel for that stop SHALL include guidance to ride only in daylight, keep headlights on, and refuel before leaving the city.
3. IF the departure mode is "Flight" and Travel_Mode is "Two-wheeler", THEN THE Output_Panel SHALL display a notice recommending a cab over a two-wheeler when carrying luggage.

### Requirement 14: Evening-Mode Eatery and Nightlife Selection

**User Story:** As a guest planning an evening out, I want a café/dinner plan, with a bar or club added when appropriate, so that my night out is sequenced sensibly.

#### Acceptance Criteria

1. WHEN mode is "Evening & night" and the start time is 6:30 PM or earlier, THE Itinerary_Builder SHALL add a café stop before the dinner stop.
2. THE Itinerary_Builder SHALL add exactly one food-or-café dinner stop to the evening plan.
3. IF the selected vibes include "Night out" and Group_Type is "Friends / solo", THEN THE Itinerary_Builder SHALL add one bar-or-club stop after the dinner stop, starting no earlier than 8:30 PM.
4. IF the evening back-by time minus the start time is less than 90 minutes, THEN THE Output_Panel SHALL display a notice asking the guest to allow at least 90 minutes and ensure the back-by time is later than the start time.
5. IF no evening stop can be fit into the available window, THEN THE Output_Panel SHALL display a notice that nothing fits that evening and suggest starting earlier or allowing more time.

### Requirement 15: Night-Out Safety Guidance

**User Story:** As a guest going out at night, I want clear safety reminders, so that I take sensible precautions for a late return.

#### Acceptance Criteria

1. WHEN the evening plan includes a bar-or-club stop, THE Output_Panel SHALL display guidance to book the return ride in advance, share live location, carry photo ID, and note that most venues close around 11:00 PM.
2. WHERE Group_Type is "Friends / solo" and no "Night out" vibe is selected, THE Output_Panel SHALL display a prompt inviting the guest to tap "Night out" to add a bar or lounge.

### Requirement 16: Data Verification and Unverified Badge System

**User Story:** As a guest, I want to know which venue details are confirmed and which are not, so that I know when I need to double-check before relying on them.

#### Acceptance Criteria

1. WHERE a Place_Catalog or Eatery_Catalog entry is flagged as unverified, THE Output_Panel SHALL display an Unverified_Badge reading "Unverified" (for places without published hours) or "Check hours" (for entries with a type label).
2. THE Explore_Doon_Page SHALL NOT display invented hours, prices, or entry rules for any entry; where such facts are not confirmed, THE Explore_Doon_Page SHALL display "Check hours" or an equivalent explicit placeholder instead.
3. THE Explore_Doon_Page SHALL display a page-level footer notice stating that hours, prices, and entry rules come from public listings and change often, that items marked Unverified or Check hours need a quick call before visiting, and that alcohol is for adults only.

### Requirement 17: Step-by-Step Directions per Place

**User Story:** As a guest unfamiliar with Dehradun, I want ordered directions to each stop, so that I can navigate there without needing outside research.

#### Acceptance Criteria

1. WHERE a Place_Catalog or Eatery_Catalog entry has an associated route key, THE Directions_Panel SHALL render that entry's directions as an ordered list of steps inside a collapsible "How to get there" element.
2. THE Explore_Doon_Page SHALL provide a "Directions" link on every stop that opens an external map search for that stop's name in Uttarakhand.
3. IF an entry has no associated route key, THEN THE Explore_Doon_Page SHALL omit the Directions_Panel for that entry rather than show an empty one.

### Requirement 18: Place and Eatery Catalog Data Corrections

**User Story:** As the system owner, I want the catalog data corrected to match verified information, so that the page does not mislead guests with outdated or wrong venue names.

#### Acceptance Criteria

1. THE Eatery_Catalog SHALL list the Tibetan café entry under the name "AMA Café" instead of "Kalsang Ama Café", retaining its "Check hours" Unverified_Badge.
2. THE Eatery_Catalog SHALL NOT contain an entry for "Mussoorie Lights Café & Bar".
3. THE Eatery_Catalog SHALL NOT contain an entry for "Y Café & Restaurant".
4. THE Eatery_Catalog SHALL list "The Highland Bakehouse & Pizzeria" in place of the placeholder "Highland Café" entry, using the owner-verified name, address, hours, and tags once supplied; until those fields are supplied, the Explore_Doon_Page SHALL retain the entry's Unverified_Badge.
5. WHERE verified Readers Coffee House details (address, hours) have not yet been fetched from https://readerscoffeehouse.in/, THE Eatery_Catalog SHALL continue to display the "Readers Coffee House" entry with a "Check hours" Unverified_Badge and SHALL NOT display fabricated address or hours for it.
6. WHERE verified "koi" venue details have not yet been supplied by the venue owner, THE Eatery_Catalog SHALL continue to display the "Koi" entry with a "Check hours" Unverified_Badge and SHALL NOT display fabricated address or hours for it.

### Requirement 19: Image Asset Convention

**User Story:** As the system owner, I want to add real venue photos later without touching the code, so that I can supply images on my own timeline.

#### Acceptance Criteria

1. THE Explore_Doon_Page SHALL load a photo for each Place_Catalog or Eatery_Catalog entry from a path formed as `<images-folder>/<entry-id>.jpg`, where `<images-folder>` defaults to `img/` and can be overridden by the `img` URL parameter.
2. IF an entry's photo fails to load, THEN THE Explore_Doon_Page SHALL remove the broken image element and continue displaying the entry's generated background artwork without a layout break.
3. THE Explore_Doon_Page SHALL require no code changes to pick up new or replaced images placed at the conventional path for an existing entry id.

### Requirement 20: Embeddability

**User Story:** As the event website maintainer, I want to embed this page in an iframe that resizes itself, so that it fits naturally into the main event page.

#### Acceptance Criteria

1. WHERE the `embed=1` URL parameter is present, or the page detects it is running inside another page's frame, THE Explore_Doon_Page SHALL hide its own header.
2. WHERE the `theme` URL parameter is set to "light" or "dark", THE Explore_Doon_Page SHALL apply that theme on load instead of its default.
3. WHERE the `transparent=1` URL parameter is present, THE Explore_Doon_Page SHALL render its page background as transparent.
4. WHEN the page's rendered height changes, THE Explore_Doon_Page SHALL post a message to its parent frame containing the current scroll height, so the Embed_Host can resize the iframe.

### Requirement 21: Official UI Token Compliance

**User Story:** As the AWS SBG GEU brand owner, I want the page to use only our official design tokens, so that it looks like a native part of the event site.

#### Acceptance Criteria

1. THE Explore_Doon_Page SHALL use the accent color `#AD5CFF` and its defined derived tokens for all interactive and highlighted elements.
2. THE Explore_Doon_Page SHALL use "Plus Jakarta Sans" for body and heading text and "JetBrains Mono" for monospace/timing text, loaded from the defined font source.
3. THE Explore_Doon_Page SHALL support both a dark theme and a light theme using the defined token overrides, toggleable via the theme control.
4. WHERE the guest's system or browser requests reduced motion, THE Explore_Doon_Page SHALL disable animations and transitions.
5. THE Explore_Doon_Page SHALL remain a single self-contained HTML file with no external build step required to run it.

### Requirement 22: Responsive Layout Without Horizontal Overflow

**User Story:** As a guest on desktop or tablet, I want the page to display without a horizontal scrollbar or clipped content, so that the layout looks correct on any screen size.

#### Acceptance Criteria

1. WHEN the viewport width is 900px or greater, THE Explore_Doon_Page SHALL lay out the Control_Panel and Output_Panel in a two-column grid that fits within the viewport width without producing horizontal page scroll.
2. THE Output_Panel SHALL NOT impose a minimum width that exceeds its allotted grid column at any supported viewport width.
3. THE Summary_Tiles bar SHALL lay out within its container width at any supported viewport width without forcing the page wider than the viewport.
4. THE Explore_Doon_Page SHALL set `overflow-x: hidden` on its root scrolling container as a safety net against unanticipated overflow.

### Requirement 23: Summary Tiles Visibility

**User Story:** As a guest who has not yet adjusted any settings, I want a cleaner first view, so that I am not shown timing tiles based on defaults I never confirmed.

#### Acceptance Criteria

1. WHILE Tuned_State is false, THE Output_Panel SHALL hide the Summary_Tiles.
2. WHEN Tuned_State becomes true, THE Output_Panel SHALL display the Summary_Tiles reflecting the current computed values.
3. WHEN mode changes between "Sunday day" and "Evening & night", THE Explore_Doon_Page SHALL reset Tuned_State to false.

### Requirement 24: Minimal Text and UI Pass

**User Story:** As the system owner, I want tighter, shorter copy and spacing, so that the page feels minimal while staying on-brand.

#### Acceptance Criteria

1. THE Explore_Doon_Page SHALL present a shortened hero heading and lead paragraph compared to the current longer copy, while preserving the official UI tokens.
2. THE Explore_Doon_Page SHALL NOT display a "Looks open" pill on any entry.
3. THE Explore_Doon_Page SHALL visually clamp each entry's note text to a maximum of 2 lines in card display.
4. THE Explore_Doon_Page SHALL present a shortened footer disclaimer compared to the current longer footer text, while retaining the core warnings from Requirement 16, acceptance criterion 3.
5. THE Explore_Doon_Page SHALL reduce vertical spacing between Control_Panel and Output_Panel sections compared to the current spacing, while preserving the defined token-based radii and shadows.

## Open Questions / Known Limitations

The following items are not yet resolved with verified facts or a confirmed design decision. They are recorded here rather than given fabricated answers:

1. **The Highland Bakehouse & Pizzeria** — the owner has indicated verified facts exist for this entry, but the specific name/address/hours/price/tag values were not included in this handoff. Requirement 18.4 requires the swap once those fields are supplied.
2. **Readers Coffee House** — real address and hours have not yet been fetched from https://readerscoffeehouse.in/. The entry remains a "Check hours" placeholder per Requirement 18.5.
3. **"Koi" venue** — no verified details have been supplied by the venue owner yet. The entry remains a "Check hours" placeholder per Requirement 18.6.
4. **Image asset list** — the owner has indicated roughly 28 photos will be supplied later with a filename convention of `<entry-id>.jpg`, but the specific filename list was not included in this handoff. Requirement 19 specifies the convention generically; the concrete list should be confirmed before implementation closes.
5. **City-to-city travel leg estimate** — city-to-city travel legs currently use a flat 25-minute estimate regardless of actual distance between two city-area stops. Whether this flat estimate is acceptable as-is or needs refinement has not been decided, and no change is specified for it in this document.
6. **Relaxed pace vs. lunch retention on long hill days** — on long Mountain_Trip days with Pace set to "Relaxed", the lunch stop added under Requirement 8 may be trimmed by the Requirement 6 trimming loop before lower-priority sightseeing stops, since it is not currently given trimming priority. Whether lunch should be protected from trimming ahead of sightseeing stops has not been decided, and no specific prioritization is mandated in this document beyond Requirement 8.2.
