# Runtime Config

## Modes

- `sample` - built-in fixtures
- `ha` - live Home Assistant + optional calendar
- `calendar` - calendar-only smoke mode

## Home Assistant

See `docs/live-home-assistant.md`.

## Calendar

Enable with:

```bash
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ENABLED=1
```

Choose one source:

```bash
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_PATH=/absolute/path/to/calendar.ics
```

or

```bash
export HOUSEHOLD_INTELLIGENCE_CALENDAR_ICS_URL=https://example.com/calendar.ics
```

## Focus person

```bash
export HOUSEHOLD_INTELLIGENCE_FOCUS_PERSON_ID=nikolaj
```
