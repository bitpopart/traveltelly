import type { NostrEvent } from '@nostrify/nostrify';

export interface CalendarEventData {
  id: string;
  pubkey: string;
  kind: 31922 | 31923;
  title: string;
  summary?: string;
  content: string;
  start: string;
  end?: string;
  location?: string;
  image?: string;
  hashtags: string[];
  participants: Array<{
    pubkey: string;
    relay?: string;
    role?: string;
  }>;
  createdAt: number;
}

/**
 * Parse a NIP-52 calendar event into a structured format
 */
export function parseCalendarEvent(event: NostrEvent): CalendarEventData | null {
  if (![31922, 31923].includes(event.kind)) {
    return null;
  }

  const tags = new Map(event.tags.map(([name, ...values]) => [name, values]));
  
  const title = tags.get('title')?.[0];
  const start = tags.get('start')?.[0];
  
  if (!title || !start) {
    return null;
  }

  // Parse participants
  const participants = event.tags
    .filter(([name]) => name === 'p')
    .map(([, pubkey, relay, role]) => ({
      pubkey,
      relay,
      role,
    }));

  // Parse hashtags
  const hashtags = event.tags
    .filter(([name]) => name === 't')
    .map(([, tag]) => tag);

  return {
    id: event.id,
    pubkey: event.pubkey,
    kind: event.kind as 31922 | 31923,
    title,
    summary: tags.get('summary')?.[0],
    content: event.content,
    start,
    end: tags.get('end')?.[0],
    location: tags.get('location')?.[0],
    image: tags.get('image')?.[0],
    hashtags,
    participants,
    createdAt: event.created_at,
  };
}

/**
 * Format event date/time for display
 */
export function formatEventDateTime(event: CalendarEventData): string {
  if (event.kind === 31922) {
    // Date-based event (YYYY-MM-DD format)
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : null;
    
    if (endDate && endDate.getTime() !== startDate.getTime()) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return startDate.toLocaleDateString();
  } else {
    // Time-based event (unix timestamp)
    const startDate = new Date(parseInt(event.start) * 1000);
    const endDate = event.end ? new Date(parseInt(event.end) * 1000) : null;
    
    if (endDate) {
      // Check if same day
      if (startDate.toDateString() === endDate.toDateString()) {
        return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}`;
      }
      return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
    }
    return startDate.toLocaleString();
  }
}

/**
 * Check if an event is happening now
 */
export function isEventActive(event: CalendarEventData): boolean {
  const now = new Date();
  
  if (event.kind === 31922) {
    // Date-based event
    const startDate = new Date(event.start);
    const endDate = event.end ? new Date(event.end) : startDate;
    
    // Set time to start/end of day for comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return now >= startDate && now <= endDate;
  } else {
    // Time-based event
    const startTime = parseInt(event.start) * 1000;
    const endTime = event.end ? parseInt(event.end) * 1000 : startTime;
    
    return now.getTime() >= startTime && now.getTime() <= endTime;
  }
}

/**
 * Check if an event is in the future
 */
export function isEventUpcoming(event: CalendarEventData): boolean {
  const now = new Date();
  
  if (event.kind === 31922) {
    // Date-based event
    const startDate = new Date(event.start);
    startDate.setHours(0, 0, 0, 0);
    return now < startDate;
  } else {
    // Time-based event
    const startTime = parseInt(event.start) * 1000;
    return now.getTime() < startTime;
  }
}

/**
 * Check if an event is in the past
 */
export function isEventPast(event: CalendarEventData): boolean {
  const now = new Date();
  
  if (event.kind === 31922) {
    // Date-based event
    const endDate = event.end ? new Date(event.end) : new Date(event.start);
    endDate.setHours(23, 59, 59, 999);
    return now > endDate;
  } else {
    // Time-based event
    const endTime = event.end ? parseInt(event.end) * 1000 : parseInt(event.start) * 1000;
    return now.getTime() > endTime;
  }
}

/**
 * Get event status
 */
export function getEventStatus(event: CalendarEventData): 'upcoming' | 'active' | 'past' {
  if (isEventActive(event)) return 'active';
  if (isEventUpcoming(event)) return 'upcoming';
  return 'past';
}

/**
 * Sort events by start time
 */
export function sortEventsByStart(events: CalendarEventData[]): CalendarEventData[] {
  return [...events].sort((a, b) => {
    let aTime: number;
    let bTime: number;
    
    if (a.kind === 31922) {
      aTime = new Date(a.start).getTime();
    } else {
      aTime = parseInt(a.start) * 1000;
    }
    
    if (b.kind === 31922) {
      bTime = new Date(b.start).getTime();
    } else {
      bTime = parseInt(b.start) * 1000;
    }
    
    return aTime - bTime;
  });
}

/**
 * Generate a unique identifier for calendar events
 */
export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validate event data before publishing
 */
export function validateEventData(data: {
  title: string;
  isAllDay: boolean;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title.trim()) {
    errors.push('Title is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (!data.isAllDay && !data.startTime) {
    errors.push('Start time is required for timed events');
  }
  
  // Validate date format
  if (data.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
    errors.push('Invalid start date format');
  }
  
  if (data.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
    errors.push('Invalid end date format');
  }
  
  // Validate end is after start
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (end < start) {
      errors.push('End date must be after start date');
    }
  }
  
  // For timed events, validate time logic
  if (!data.isAllDay && data.startTime && data.endTime) {
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    let endDateTime: Date;
    
    if (data.endDate) {
      endDateTime = new Date(`${data.endDate}T${data.endTime}`);
    } else {
      endDateTime = new Date(`${data.startDate}T${data.endTime}`);
    }
    
    if (endDateTime <= startDateTime) {
      errors.push('End time must be after start time');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}