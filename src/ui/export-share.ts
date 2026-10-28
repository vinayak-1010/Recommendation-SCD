import type { Itinerary, TripRequest } from '../engine/types.ts';

export function encodeTripState(req: TripRequest): string {
  const payload = {
    d: req.date,
    st: req.start,
    ret: req.returnBy,
    tr: req.transport,
    in: req.interests,
    gr: req.group,
    pc: req.pace,
    l: req.locale || 'en'
  };
  return encodeURIComponent(btoa(JSON.stringify(payload)));
}

export function decodeTripState(hash: string): Partial<TripRequest> | null {
  try {
    const raw = atob(decodeURIComponent(hash.replace(/^#/, '')));
    const p = JSON.parse(raw);
    return {
      date: p.d,
      start: p.st,
      returnBy: p.ret,
      transport: p.tr,
      interests: p.in,
      group: p.gr,
      pace: p.pc,
      locale: p.l
    };
  } catch {
    return null;
  }
}

export function generateICS(plan: Itinerary, dateStr: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dParts = dateStr.split('-');
  const dateCompact = `${dParts[0]}${dParts[1]}${dParts[2]}`;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `T${pad(h)}${pad(m)}00`;
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AWS SBG GEU//Explore Doon//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  for (const stop of plan.stops) {
    const startStr = `${dateCompact}${formatTime(stop.arrival)}`;
    const endStr = `${dateCompact}${formatTime(stop.departure)}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${stop.place.id}-${Date.now()}@awssbggeu.com`,
      `DTSTAMP:${dateCompact}T000000Z`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${stop.place.name}`,
      `DESCRIPTION:${stop.whyThisStop.replace(/,/g, '\\,')} - What to do: ${stop.whatToDo.join('; ').replace(/,/g, '\\,')}`,
      `LOCATION:${stop.place.name}\\, Dehradun\\, Uttarakhand`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadICS(plan: Itinerary, dateStr: string): void {
  const content = generateICS(plan, dateStr);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Explore-Doon-${dateStr}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateGoogleCalendarUrl(plan: Itinerary, dateStr: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dParts = dateStr.split('-');
  const dateCompact = `${dParts[0]}${dParts[1]}${dParts[2]}`;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `T${pad(h)}${pad(m)}00Z`;
  };

  const firstStop = plan.stops[0];
  const lastStop = plan.stops[plan.stops.length - 1];
  const startTime = firstStop ? firstStop.arrival : 480;
  const endTime = lastStop ? lastStop.departure : 1020;

  const startStr = `${dateCompact}${formatTime(startTime)}`;
  const endStr = `${dateCompact}${formatTime(endTime)}`;
  const title = `Explore Doon: ${plan.title}`;
  const details = `AWS Community Day 2026 Itinerary. Stops: ${plan.stops.map(s => s.place.name).join(' -> ')}. Return to Graphic Era by ${Math.floor(plan.expectedReturn / 60)}:${String(plan.expectedReturn % 60).padStart(2, '0')}.`;
  const location = 'Graphic Era University, Clement Town, Dehradun';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

export function getQRCodeUrl(targetUrl: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(targetUrl)}`;
}

export function triggerPrintItinerary(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

export function generateWhatsAppShareUrl(plan: Itinerary, dateStr: string, fullMapUrl: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (min: number) => {
    const h = Math.floor(min / 60) % 24;
    const m = min % 60;
    const ampm = h < 12 ? 'AM' : 'PM';
    const dh = h % 12 || 12;
    return `${dh}:${pad(m)} ${ampm}`;
  };

  let text = `🏔️ *Explore Doon Day Out Plan* (${dateStr})\n`;
  text += `⏱️ *Window:* ${fmt(plan.summary.start)} – ${fmt(plan.summary.end)}\n`;
  text += `🚗 *Total Distance:* ~${plan.summary.totalDistanceKm} km · *Return Buffer:* ${plan.summary.returnBufferMin} mins\n\n`;
  text += `📍 *Stops Planned:*\n`;

  plan.stops.forEach((s, idx) => {
    text += `${idx + 1}. *${s.place.name}* (${fmt(s.arrival)} – ${fmt(s.departure)})\n`;
    if (s.whatToDo?.[0]) text += `   • ${s.whatToDo[0]}\n`;
  });

  if (plan.budget) {
    text += `\n💰 *Estimated Cab Cost:* ₹${plan.budget.carEstimate.min}–₹${plan.budget.carEstimate.max} (Split 4 ways: ~₹${Math.round(plan.budget.carEstimate.min / 4)}–₹${Math.round(plan.budget.carEstimate.max / 4)}/person)\n`;
  }

  text += `\n🗺️ *Full Google Maps Route:*\n${fullMapUrl}\n\n_Planned with Explore Doon Travel Guide_`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}


