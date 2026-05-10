const { createInputSnapshot } = require('../../contracts/src');
const { loadRuntimeConfig } = require('./config');
const { loadHomeAssistantSources } = require('./home-assistant');
const { loadCalendarSources } = require('./calendar');

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function toIso(value, fallback = null) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizeHomeAssistant(raw = {}) {
  return {
    occupancy: raw.occupancy ?? raw.homeMode ?? null,
    mode: raw.mode ?? raw.homeMode ?? null,
    quietHours: raw.quietHours ?? null,
    anomalies: ensureArray(raw.anomalies).map((item) => ({
      id: item.id || 'anomaly',
      type: item.type || 'generic',
      title: item.title || item.message || 'Home anomaly',
      severity: item.severity || 'medium',
      message: item.message || item.title || 'Unknown anomaly'
    }))
  };
}

function normalizeCalendar(rawEvents = []) {
  return ensureArray(rawEvents)
    .map((event, index) => ({
      id: event.id || `calendar-${index + 1}`,
      title: event.title || event.summary || 'Untitled event',
      ownerId: event.ownerId || event.personId || null,
      startAt: toIso(event.startAt || event.start || event.startsAt),
      endAt: toIso(event.endAt || event.end || event.endsAt),
      location: event.location || null,
      travelMinutes: Number.isFinite(event.travelMinutes) ? event.travelMinutes : 0,
      leaveByAt: toIso(event.leaveByAt),
      metadata: event.metadata || null
    }))
    .filter((event) => event.startAt && event.endAt);
}

function normalizeTasks(rawTasks = []) {
  return ensureArray(rawTasks).map((task, index) => ({
    id: task.id || `task-${index + 1}`,
    title: task.title || task.name || 'Untitled task',
    assigneeId: task.assigneeId || task.ownerId || null,
    dueAt: toIso(task.dueAt || task.dueDate),
    status: task.status || 'open',
    priority: task.priority || 'normal',
    category: task.category || 'chores',
    estimatedMinutes: Number.isFinite(task.estimatedMinutes) ? task.estimatedMinutes : null
  }));
}

function normalizeWeather(raw = {}) {
  return {
    condition: raw.condition || raw.summary || null,
    temperatureC: Number.isFinite(raw.temperatureC) ? raw.temperatureC : null,
    rainRisk: Number.isFinite(raw.rainRisk) ? raw.rainRisk : null,
    windKph: Number.isFinite(raw.windKph) ? raw.windKph : null
  };
}

function normalizeEnergy(raw = {}) {
  return {
    solarWatts: Number.isFinite(raw.solarWatts) ? raw.solarWatts : null,
    homeLoadWatts: Number.isFinite(raw.homeLoadWatts) ? raw.homeLoadWatts : null,
    priceLevel: raw.priceLevel || null,
    cheapUntil: toIso(raw.cheapUntil),
    expensiveFrom: toIso(raw.expensiveFrom)
  };
}

function buildSnapshotFromSources({ householdId, generatedAt, people = [], homeAssistant = {}, calendar = [], tasks = [], weather = {}, energy = {}, preferences = null }) {
  return createInputSnapshot({
    generatedAt: toIso(generatedAt, new Date().toISOString()),
    householdId: householdId || 'default-household',
    people: ensureArray(people),
    chores: normalizeTasks(tasks),
    calendarEvents: normalizeCalendar(calendar),
    homeState: normalizeHomeAssistant(homeAssistant),
    energyState: normalizeEnergy(energy),
    weather: normalizeWeather(weather),
    preferences
  });
}

async function loadSources(configOverrides = {}) {
  const config = loadRuntimeConfig(configOverrides);
  if (config.mode === 'ha' || config.ha.useLive) {
    const sources = await loadHomeAssistantSources(config);
    const calendar = await loadCalendarSources(config);
    return { ...sources, calendar };
  }
  if (config.mode === 'calendar') {
    const calendar = await loadCalendarSources(config);
    return {
      ...loadSampleSources(),
      calendar,
      tasks: [],
      homeAssistant: {},
      weather: {},
      energy: {}
    };
  }
  return loadSampleSources();
}

function loadSampleSources() {
  const generatedAt = new Date().toISOString();
  return {
    householdId: 'home-1',
    generatedAt,
    people: [
      { id: 'nikolaj', name: 'Nikolaj' },
      { id: 'janice', name: 'Janice' }
    ],
    homeAssistant: {
      homeMode: 'home',
      quietHours: { start: '22:00', end: '07:00' },
      anomalies: [
        { id: 'front-door', type: 'door', title: 'Front door left open', severity: 'high', message: 'Front door has been open for 12 minutes.' }
      ]
    },
    calendar: [
      {
        id: 'pickup',
        title: 'School pickup',
        ownerId: 'nikolaj',
        startAt: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
        leaveByAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
        travelMinutes: 20,
        location: 'School'
      },
      {
        id: 'meeting',
        title: 'Customer call',
        ownerId: 'nikolaj',
        startAt: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
        endAt: new Date(Date.now() + 145 * 60 * 1000).toISOString(),
        travelMinutes: 0,
        location: 'Home office'
      }
    ],
    tasks: [
      {
        id: 'dishwasher',
        title: 'Empty dishwasher',
        assigneeId: 'nikolaj',
        dueAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'open',
        priority: 'high',
        estimatedMinutes: 10,
        category: 'chores'
      },
      {
        id: 'laundry',
        title: 'Start laundry',
        assigneeId: 'janice',
        dueAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        priority: 'normal',
        estimatedMinutes: 15,
        category: 'chores'
      }
    ],
    weather: {
      condition: 'light rain later',
      temperatureC: 15,
      rainRisk: 0.7,
      windKph: 18
    },
    energy: {
      solarWatts: 2900,
      homeLoadWatts: 600,
      priceLevel: 'cheap',
      cheapUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      expensiveFrom: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    },
    preferences: {
      focusPersonId: 'nikolaj'
    }
  };
}

module.exports = {
  normalizeHomeAssistant,
  normalizeCalendar,
  normalizeTasks,
  normalizeWeather,
  normalizeEnergy,
  buildSnapshotFromSources,
  loadSampleSources,
  loadSources,
  loadRuntimeConfig,
  loadHomeAssistantSources,
  loadCalendarSources
};
