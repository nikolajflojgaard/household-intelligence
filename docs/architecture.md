# Architecture

## Core layers

### Adapters
Fetch and normalize raw signals from:
- Home Assistant
- calendars
- chores/tasks
- weather
- energy

Adapters do not score or prioritize.

### Engine
Owns:
- candidate generation
- scoring
- dedupe
- suppression
- ranking
- explanations

This is the product brain.

### Briefs
Render the same core result into:
- Telegram text
- Home Assistant package/card payloads
- JSON/API output

### Storage
Persist:
- input snapshots
- recommendation runs
- feedback events
- suppression memory

### Delivery apps
- `apps/telegram-worker`: scheduled brief + feedback ingestion
- `apps/ha-bridge`: publish result into Home Assistant surfaces

## Architecture rules

1. No UI-owned decision logic.
2. No adapter-owned prioritization.
3. Every recommendation needs `whyNow` and source signals.
4. Deterministic ranking first.
5. Feedback must be stored.
6. Every output surface consumes the same engine result.
