function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStateList(state) {
  if (!state || typeof state !== 'object') return [];
  const tasks = Array.isArray(state.attributes?.tasks) ? state.attributes.tasks : [];
  return tasks
    .map((item, index) => ({
      id: item.id || item.uid || `ha-task-${index + 1}`,
      title: String(item.title || item.name || item.task || '').trim(),
      assigneeId: Array.isArray(item.assignees) ? item.assignees[0] : item.assignee || item.person || null,
      dueAt: item.datetime || item.due || item.date || null,
      status: item.status || 'open',
      priority: item.priority || 'normal',
      category: item.category || 'chores',
      estimatedMinutes: toNumber(item.estimated_minutes || item.estimatedMinutes, null)
    }))
    .filter((item) => item.title);
}

function weatherFromState(state) {
  if (!state || typeof state !== 'object') return {};
  const attrs = state.attributes || {};
  return {
    condition: state.state || attrs.condition || null,
    temperatureC: toNumber(attrs.temperature, null),
    rainRisk: toNumber(attrs.precipitation_probability ?? attrs.humidity, null),
    windKph: toNumber(attrs.wind_speed, null)
  };
}

function anomalyFromState(entityId, state) {
  if (!state || typeof state !== 'object') return null;
  const active = ['on', 'open', 'problem', 'detected'].includes(String(state.state || '').toLowerCase());
  if (!active) return null;
  return {
    id: entityId,
    type: state.attributes?.device_class || 'generic',
    title: state.attributes?.friendly_name || entityId,
    severity: 'high',
    message: `${state.attributes?.friendly_name || entityId} is currently ${state.state}.`
  };
}

async function fetchJson(baseUrl, token, path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HA request failed ${response.status}: ${body.slice(0, 240)}`);
  }
  return response.json();
}

async function fetchState(baseUrl, token, entityId) {
  try {
    return await fetchJson(baseUrl, token, `/api/states/${entityId}`);
  } catch (_) {
    return null;
  }
}

function buildPeople(config) {
  const focus = config.focusPersonId || 'nikolaj';
  return [{ id: focus, name: focus.charAt(0).toUpperCase() + focus.slice(1) }];
}

async function loadHomeAssistantSources(config) {
  if (!config?.ha?.baseUrl || !config?.ha?.token) {
    throw new Error('Missing Home Assistant baseUrl or token');
  }

  const ha = config.ha;
  const [
    householdChores,
    focusChores,
    weather,
    solarPower,
    homeLoad,
    occupancy,
    solarToday,
    ...anomalyStates
  ] = await Promise.all([
    fetchState(ha.baseUrl, ha.token, ha.householdChoresEntity),
    fetchState(ha.baseUrl, ha.token, ha.focusChoresEntity),
    fetchState(ha.baseUrl, ha.token, ha.weatherEntity),
    fetchState(ha.baseUrl, ha.token, ha.solarPowerEntity),
    fetchState(ha.baseUrl, ha.token, ha.homeLoadEntity),
    fetchState(ha.baseUrl, ha.token, ha.occupancyEntity),
    fetchState(ha.baseUrl, ha.token, ha.solarTodayEntity),
    ...ha.anomalyEntities.map((entityId) => fetchState(ha.baseUrl, ha.token, entityId))
  ]);

  const tasks = [
    ...parseStateList(householdChores),
    ...parseStateList(focusChores)
  ];

  const solarWatts = toNumber(solarPower?.state, 0);
  const homeLoadWatts = toNumber(homeLoad?.state, 0);
  const surplus = solarWatts - homeLoadWatts;

  return {
    householdId: config.householdId,
    generatedAt: new Date().toISOString(),
    people: buildPeople(config),
    homeAssistant: {
      homeMode: occupancy?.state || null,
      occupancy: occupancy?.state || null,
      quietHours: { start: '22:00', end: '07:00' },
      anomalies: anomalyStates.map((state, index) => anomalyFromState(ha.anomalyEntities[index], state)).filter(Boolean)
    },
    tasks,
    calendar: [],
    weather: weatherFromState(weather),
    energy: {
      solarWatts,
      homeLoadWatts,
      priceLevel: surplus >= ha.cheapThresholdWatts ? 'cheap' : 'normal',
      cheapUntil: null,
      expensiveFrom: null,
      solarTodayKwh: toNumber(solarToday?.state, null)
    },
    preferences: {
      focusPersonId: config.focusPersonId
    },
    raw: {
      householdChores,
      focusChores,
      weather,
      solarPower,
      homeLoad,
      occupancy,
      solarToday
    }
  };
}

module.exports = {
  fetchState,
  loadHomeAssistantSources,
  parseStateList,
  weatherFromState,
  anomalyFromState
};
