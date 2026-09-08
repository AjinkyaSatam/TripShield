import { GraphNode } from '../graph/types';

/**
 * Formats a Date object to iCalendar date-time string (UTC format: YYYYMMDDTHHMMSSZ)
 */
export function formatToICSDate(d: Date | string): string {
  const date = new Date(d);
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an RFC 5545 compliant .ics calendar file content from trip bookings
 */
export function generateICSContent(
  tripName: string,
  travelerName: string,
  bookings: GraphNode[]
): string {
  const now = formatToICSDate(new Date());

  const events = bookings.map((b) => {
    const start = formatToICSDate(b.startTime);
    const end = formatToICSDate(b.endTime);
    const status = b.status === 'disrupted' ? 'CANCELLED' : 'CONFIRMED';
    const cleanTitle = b.title.replace(/[,;]/g, ' ');
    const cleanLocation = b.location.replace(/[,;]/g, ' ');
    const cleanProvider = b.provider.replace(/[,;]/g, ' ');

    const description = [
      `Category: ${b.type}`,
      `Provider: ${cleanProvider}`,
      `Status: ${b.status.toUpperCase()}`,
      `Cost: INR ${b.cost.toLocaleString('en-IN')}`,
      `Policy: ${b.cancellationPolicy || 'Standard'}`,
      `Protected by TripShield AI Autonomous Disruption Recovery`,
    ].join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${b.id}-tripshield@autonomous-travel.ai`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:[${b.type}] ${cleanTitle}`,
      `LOCATION:${cleanLocation}`,
      `DESCRIPTION:${description}`,
      `STATUS:${status}`,
      'TRANSP:OPAQUE',
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripShield AI//Autonomous Disruption Recovery//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:TripShield - ${tripName}`,
    `X-WR-CALDESC:Autonomous Travel Itinerary for ${travelerName}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of an .ics calendar file
 */
export function triggerICSDownload(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
