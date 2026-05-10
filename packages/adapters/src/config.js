const { execFileSync } = require('child_process');

function readKeychainSecret(service) {
  try {
    const user = process.env.USER || execFileSync('whoami', { encoding: 'utf8' }).trim();
    return execFileSync('security', ['find-generic-password', '-a', user, '-s', service, '-w'], { encoding: 'utf8' }).trim();
  } catch (_) {
    return null;
  }
}

function envBool(name, fallback = false) {
  const value = process.env[name];
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function loadRuntimeConfig(overrides = {}) {
  const token = overrides.token
    || process.env.HOUSEHOLD_INTELLIGENCE_HA_TOKEN
    || process.env.HOMEASSISTANT_TOKEN
    || readKeychainSecret('homeassistant-mcp-token');

  return {
    mode: overrides.mode || process.env.HOUSEHOLD_INTELLIGENCE_MODE || 'sample',
    householdId: overrides.householdId || process.env.HOUSEHOLD_INTELLIGENCE_HOUSEHOLD_ID || 'home-1',
    focusPersonId: overrides.focusPersonId || process.env.HOUSEHOLD_INTELLIGENCE_FOCUS_PERSON_ID || 'nikolaj',
    calendar: {
      enabled: overrides.calendarEnabled != null ? overrides.calendarEnabled : envBool('HOUSEHOLD_INTELLIGENCE_CALENDAR_ENABLED', false),
      icsUrl: overrides.calendarIcsUrl || process.env.HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_URL || null,
      icsPath: overrides.calendarIcsPath || process.env.HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_PATH || null
    },
    ha: {
      baseUrl: overrides.baseUrl || process.env.HOUSEHOLD_INTELLIGENCE_HA_BASE_URL || process.env.HOMEASSISTANT_BASE_URL || 'http://192.168.0.241:8123',
      token,
      publishEnabled: overrides.publishEnabled != null ? overrides.publishEnabled : envBool('HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENABLED', false),
      publishDryRun: overrides.publishDryRun != null ? overrides.publishDryRun : envBool('HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_DRY_RUN', true),
      publishEntryId: overrides.publishEntryId || process.env.HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENTRY_ID || null,
      publishSource: overrides.publishSource || process.env.HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_SOURCE || 'household-intelligence',
      weatherEntity: overrides.weatherEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_WEATHER_ENTITY || 'weather.forecast_hjem',
      householdChoresEntity: overrides.householdChoresEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_HOUSEHOLD_CHORES_ENTITY || 'sensor.household_chores_next_3_tasks',
      focusChoresEntity: overrides.focusChoresEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_FOCUS_CHORES_ENTITY || 'sensor.household_chores_nikolaj_next_3_tasks_2',
      solarPowerEntity: overrides.solarPowerEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_SOLAR_POWER_ENTITY || 'sensor.solax_ac_power_3',
      homeLoadEntity: overrides.homeLoadEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_HOME_LOAD_ENTITY || 'sensor.solax_husforbrug_effekt',
      solarTodayEntity: overrides.solarTodayEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_SOLAR_TODAY_ENTITY || 'sensor.solax_yield_today_4',
      occupancyEntity: overrides.occupancyEntity || process.env.HOUSEHOLD_INTELLIGENCE_HA_OCCUPANCY_ENTITY || 'input_select.house_mode',
      anomalyEntities: overrides.anomalyEntities || (process.env.HOUSEHOLD_INTELLIGENCE_HA_ANOMALY_ENTITIES || 'binary_sensor.frontdoor_contact').split(',').map((item) => item.trim()).filter(Boolean),
      cheapThresholdWatts: Number(process.env.HOUSEHOLD_INTELLIGENCE_HA_CHEAP_THRESHOLD_WATTS || overrides.cheapThresholdWatts || 1000),
      useLive: overrides.useLive != null ? overrides.useLive : envBool('HOUSEHOLD_INTELLIGENCE_USE_REAL_HA', false)
    }
  };
}

module.exports = {
  readKeychainSecret,
  envBool,
  loadRuntimeConfig
};
