# Live Home Assistant Mode

## Purpose

Use real Home Assistant data instead of the sample fixture data.

This is the first real integration step.

## How it works

The adapter reads Home Assistant state over the REST API.

Token lookup order:
1. `HOUSEHOLD_INTELLIGENCE_HA_TOKEN`
2. `HOMEASSISTANT_TOKEN`
3. macOS Keychain service: `homeassistant-mcp-token`

Base URL lookup order:
1. `HOUSEHOLD_INTELLIGENCE_HA_BASE_URL`
2. `HOMEASSISTANT_BASE_URL`
3. default: `http://192.168.0.241:8123`

## Important env vars

```bash
export HOUSEHOLD_INTELLIGENCE_MODE=ha
export HOUSEHOLD_INTELLIGENCE_USE_REAL_HA=1
```

Optional entity overrides:

```bash
export HOUSEHOLD_INTELLIGENCE_HA_HOUSEHOLD_CHORES_ENTITY=sensor.household_chores_next_3_tasks
export HOUSEHOLD_INTELLIGENCE_HA_FOCUS_CHORES_ENTITY=sensor.household_chores_nikolaj_next_3_tasks_2
export HOUSEHOLD_INTELLIGENCE_HA_WEATHER_ENTITY=weather.forecast_hjem
export HOUSEHOLD_INTELLIGENCE_HA_SOLAR_POWER_ENTITY=sensor.solax_ac_power_3
export HOUSEHOLD_INTELLIGENCE_HA_HOME_LOAD_ENTITY=sensor.solax_husforbrug_effekt
export HOUSEHOLD_INTELLIGENCE_HA_SOLAR_TODAY_ENTITY=sensor.solax_yield_today_4
export HOUSEHOLD_INTELLIGENCE_HA_OCCUPANCY_ENTITY=input_select.house_mode
export HOUSEHOLD_INTELLIGENCE_HA_ANOMALY_ENTITIES=binary_sensor.frontdoor_contact
```

## Run it

```bash
cd household-intelligence
HOUSEHOLD_INTELLIGENCE_MODE=ha HOUSEHOLD_INTELLIGENCE_USE_REAL_HA=1 npm run demo
```

## Current limitations

- calendar is still not live-wired
- Home Assistant tasks are normalized from sensor attributes only
- energy pricing is inferred crudely from solar surplus right now
- Home Assistant publishing is still local payload generation, not a live service call

Bluntly: this is real data in, but not yet the full production loop.
