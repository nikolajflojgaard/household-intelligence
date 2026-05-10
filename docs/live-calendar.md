# Live Calendar Mode

## Purpose

Bring real calendar pressure into the engine instead of relying only on household tasks and Home Assistant signals.

## Current supported path

Right now the calendar adapter supports ICS input from either:
- a local `.ics` file path
- an ICS URL

That is enough to prove the integration path without hard-binding to one calendar vendor yet.

## Env vars

```bash
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_PATH=/absolute/path/to/calendar.ics
```

Or:

```bash
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_URL=https://example.com/calendar.ics
```

Optional mode for calendar-only smoke runs:

```bash
export HOUSEHOLD_INTELLIGENCE_MODE=calendar
```

## What it currently extracts

- title
- start time
- end time
- location
- description

## Current limitations

- no attendee parsing yet
- no travel-time inference yet
- no direct Google/Apple API path yet
- owner is currently inferred from the focus person

## Run smoke check

```bash
npm run smoke:calendar
```
