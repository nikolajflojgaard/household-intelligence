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
    dashboard/          # optional thin UI later
    ha-bridge/          # Home Assistant-facing publisher
    telegram-worker/    # scheduled delivery and feedback handling
  packages/
    adapters/           # input connectors + normalization
    briefs/             # Telegram / HA / JSON renderers
    contracts/          # shared schemas and validation helpers
    engine/             # scoring, ranking, dedupe, explanations
    storage/            # runs, snapshots, feedback persistence
  docs/
    architecture.md
    contracts.md
    mvp.md
    product.md
    scoring.md
  scripts/
    demo-run.js
  TASKS.md
```

## Current status

This repo is now a real starter structure, not just an idea dump.

Already in place:

- root workspace scaffold
- package manifests
- product / architecture / scoring / MVP docs
- contract definitions and validation helpers
- sample source fixtures and normalized snapshot builder
- first candidate generators for overdue tasks, due-today tasks, leave-by pressure, and schedule conflicts
- first brief composer and Telegram text renderer
- backlog with 50 implementation tasks

Not built yet:

- live Home Assistant/calendar/task integrations
- deeper weighted ranking and suppression memory
- storage
- Telegram feedback handling
- Home Assistant publisher

## Architecture principles

- deterministic core before LLM garnish
- no UI-owned business logic
- adapters normalize, engine decides
- every recommendation must explain itself
- feedback is mandatory, not optional
- all surfaces consume the same engine result

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

### Run demo placeholder

```bash
cd household-intelligence
npm run demo
```

### Validate contracts quickly

```bash
node -e "const c=require('./packages/contracts/src'); console.log(c.createInputSnapshot({generatedAt:new Date().toISOString(),householdId:'home-1'}))"
```

## First implementation focus

The right next build order is:

1. contracts
2. normalized snapshot input
3. candidate generation
4. scoring + ranking + dedupe
5. daily brief renderer
6. Telegram delivery
7. Home Assistant publish layer
8. feedback loop

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

The first concrete code slice should finish:

- contracts
- snapshot normalization
- candidate generators for chores/calendar/conflicts/energy
- first deterministic ranking pass

## Reality check

This only matters if the output feels sharp in daily use.

If it turns into generic AI productivity sludge, it is dead.
