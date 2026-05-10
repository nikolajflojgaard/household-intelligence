# MVP

## Goal

Make one household say: this actually helps me decide what to do.

## In scope

### Inputs
- calendar events
- chores/tasks
- occupancy/home mode
- weather
- energy/solar/load if available
- per-person assignment

### Outputs
- Top 3 Things Today
- daily brief
- feedback actions: done / snooze / useful / wrong

### Delivery
- Telegram
- Home Assistant
- JSON/local API

## Out of scope

- broad chat assistant
- native mobile app
- giant settings UI
- multi-household collaboration
- voice-first interface
- autonomous risky actions
- marketplace complexity

## Success metrics

- brief used at least 4x per week
- at least 1 action per day marked useful or done
- output quality feels right more than 60 percent of the time
- user reports friction avoided within week 1

## Degraded mode rule

If major signal sources are missing, the system should still produce a best-effort result instead of failing silently.

But it must say so plainly.

Bad degraded mode:
- fake certainty
- pretending nothing is missing
- dumping generic filler

Good degraded mode:
- admit missing sources
- still suggest one concrete useful action if possible
- lower confidence implicitly through ranking/suppression
