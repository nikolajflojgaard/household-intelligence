# Household Intelligence

A local-first decision engine for busy households.

This project is meant to turn household signals into ranked action instead of dumping more dashboards, cards, and notifications on people.

## The idea

Most home and family software is weak in the same way:

- calendars show events but do not resolve household pressure
- chore apps track tasks but do not know what matters now
- smart home systems expose state but do not make decisions
- generic AI assistants talk a lot and decide very little

Household Intelligence is the missing decision layer.

It should answer:

- what matters right now
- who should do it
- why now
- what can wait
- what becomes annoying, expensive, or stressful if ignored

## Product wedge

The first sellable wedge is a **Home Assistant intelligence layer**.

That means:

- Top 3 Things Today
- short ruthless daily brief
- person-aware chores/tasks
- energy-aware recommendations
- household risk detection
- Telegram and Home Assistant delivery

Longer term, this can grow into a broader **Household Operating System**.

## MVP

The MVP only needs to do two things well:

1. generate a useful daily brief
2. return the top 3 household actions right now

If it does not change behavior, it is not a product.

## Repo structure

```text
household-intelligence/
  apps/
    dashboard/          # thin local model surface
    ha-bridge/          # Home Assistant-facing publisher
    telegram-worker/    # scheduled delivery and feedback handling
  fixtures/             # test scenarios for output quality
  packages/
    adapters/           # input connectors + normalization
    briefs/             # Telegram / HA / JSON renderers
    contracts/          # shared schemas and validation helpers
    engine/             # scoring, ranking, dedupe, explanations
    storage/            # runs, snapshots, feedback persistence
  docs/
    onboarding/
      first-beta-household.md
    architecture.md
    contracts.md
    live-calendar.md
    live-home-assistant.md
    live-telegram.md
    mvp.md
    next-phase.md
    product.md
    runtime-config.md
    scoring.md
    telegram-setup-notes.md
  scripts/
    contract-smoke.js
    demo-run.js
    explanation-regression.js
    full-smoke.js
    quality-fixtures.js
  TASKS.md
```

## Current status

This repo is now a real early product prototype.

Already in place:

- root workspace scaffold
- package manifests
- product / architecture / scoring / MVP docs
- contract definitions and validation helpers
- sample source fixtures and normalized snapshot builder
- candidate generators for tasks, leave-by pressure, schedule conflicts, home anomalies, and energy opportunities
- weighted scoring, confidence modifier, dedupe, and quiet-hours suppression
- degraded-mode fallback behavior when signals are missing
- brief composers for Telegram, JSON, and Home Assistant payloads
- JSON-backed run/feedback persistence with SQLite schema ready
- demo flows for dashboard, Telegram worker, and Home Assistant package generation
- quality fixtures and explanation regression checks
- backlog with 50 implementation tasks

Not built yet:

- richer calendar semantics (attendees, travel, leave-by inference)
- deeper learning from feedback beyond dismissal suppression
- real scheduler wiring
- inbound Telegram bot handling and command routing
- real Home Assistant publish API calls

## Architecture principles

- deterministic core before LLM garnish
- no UI-owned business logic
- adapters normalize, engine decides
- every recommendation must explain itself
- feedback is mandatory, not optional
- all surfaces consume the same engine result
- degraded mode must be explicit, not fake certainty

## Core data contracts

The first implemented code is in `packages/contracts`.

Main shapes:

- `InputSnapshot`
- `TopAction`
- `TopThreeResult`
- `DailyBrief`
- `FeedbackEvent`

These are the backbone of the system and stop every surface from inventing its own payload shape.

## Planned decision flow

1. adapters collect signals from Home Assistant, calendar, tasks, weather, energy
2. snapshot builder normalizes them into one `InputSnapshot`
3. engine generates candidate actions
4. engine scores, dedupes, suppresses, and ranks them
5. brief renderer packages output for Telegram / Home Assistant / JSON
6. storage keeps run history and user feedback
7. feedback sharpens future suppression and prioritization

## Suggested scoring model

Base components:

- urgency
- impact
- time sensitivity
- agency
- confidence
- uniqueness / duplicate penalty

The product should be blunt and constrained.

Bad output:

- vague lifestyle advice
- more than 3 priorities
- duplicated recommendations
- dashboard filler disguised as intelligence

Good output:

- specific
- ranked
- explainable
- actionable in under 10 seconds

## Local development

### Run the full demo

```bash
cd household-intelligence
npm run demo
```

### Run smoke validation

```bash
npm test
```

### Run live Home Assistant smoke check

```bash
npm run smoke:ha
```

### Run calendar smoke check

```bash
npm run smoke:calendar
```

### Run Telegram delivery smoke check

```bash
npm run smoke:telegram
```

### Run output quality checks

```bash
node scripts/quality-fixtures.js
node scripts/explanation-regression.js
```

### Validate contracts quickly

```bash
node -e "const c=require('./packages/contracts/src'); console.log(c.createInputSnapshot({generatedAt:new Date().toISOString(),householdId:'home-1'}))"
```

## First implementation focus

The right next build order is:

1. real Home Assistant publish wiring
2. inbound Telegram command/feedback handling
3. richer feedback learning
4. proper sqlite runtime
5. multi-household hardening

## Why this could be sellable

Because most competitors stop at visibility.

This tries to win on **decision quality**.

The moat is not a pretty dashboard.
The moat is trust:

- getting the ranking right
- being explainable
- being useful often enough that people depend on it

## Backlog

See `TASKS.md` for the implementation backlog.

The next concrete code slice should finish real integrations, not more theory.

## Reality check

This only matters if the output feels sharp in daily use.

If it turns into generic AI productivity sludge, it is dead.
