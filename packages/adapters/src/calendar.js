const fs = require('fs');

function unfoldIcs(text) {
  return String(text || '').replace(/\r?\n[ \t]/g, '');
}

function parseIcsDate(value) {
  if (!value) return null;
  const raw = String(value).trim();

  if (/^\d{8}T\d{6}Z$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = raw.slice(9, 11);
    const minute = raw.slice(11, 13);
    const second = raw.slice(13, 15);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  if (/^\d{8}T\d{6}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    const hour = raw.slice(9, 11);
    const minute = raw.slice(11, 13);
    const second = raw.slice(13, 15);
    const local = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return Number.isNaN(local.getTime()) ? null : local.toISOString();
  }

  if (/^\d{8}$/.test(raw)) {
    const year = raw.slice(0, 4);
    const month = raw.slice(4, 6);
    const day = raw.slice(6, 8);
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseIcs(text) {
  const unfolded = unfoldIcs(text);
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1);

  return blocks.map((block, index) => {
    const body = block.split('END:VEVENT')[0] || '';
    const lines = body.split(/\r?\n/).filter(Boolean);
    const event = { id: `ics-${index + 1}` };

    for (const line of lines) {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) continue;
      const rawKey = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1).trim();
      const key = rawKey.split(';')[0].toUpperCase();

      if (key === 'UID') event.id = value;
      if (key === 'SUMMARY') event.title = value;
      if (key === 'DTSTART') event.startAt = parseIcsDate(value);
      if (key === 'DTEND') event.endAt = parseIcsDate(value);
      if (key === 'LOCATION') event.location = value;
      if (key === 'DESCRIPTION') event.description = value;
    }

    return event;
  }).filter((event) => event.startAt && event.endAt);
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Calendar fetch failed ${response.status}`);
  }
  return response.text();
}

function inferOwnerId(config) {
  return config.focusPersonId || 'nikolaj';
}

function toCalendarEvents(events, config) {
  return events.map((event) => ({
    id: event.id,
    title: event.title || 'Untitled event',
    ownerId: inferOwnerId(config),
    startAt: event.startAt,
    endAt: event.endAt,
    location: event.location || null,
    travelMinutes: 0,
    leaveByAt: null,
    metadata: {
      source: 'ics',
      description: event.description || null
    }
  }));
}

async function loadCalendarSources(config) {
  const calendar = config.calendar || {};
  if (!calendar.enabled) return [];

  let text = null;
  if (calendar.icsUrl) {
    text = await fetchText(calendar.icsUrl);
  } else if (calendar.icsPath) {
    text = fs.readFileSync(calendar.icsPath, 'utf8');
  } else {
    return [];
  }

  return toCalendarEvents(parseIcs(text), config);
}

module.exports = {
  parseIcsDate,
  parseIcs,
  loadCalendarSources,
  toCalendarEvents
};
