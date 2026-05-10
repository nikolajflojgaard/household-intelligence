# Household Intelligence Tasks

## Phase 0 — repo foundation

- [x] 01. Create workspace package manifests for each app/package
- [x] 02. Add shared TypeScript or JS runtime decision and standardize tooling
- [x] 03. Add root lint, test, and format commands
- [x] 04. Add `.gitignore`, `.editorconfig`, and minimal contributor notes
- [x] 05. Write `docs/contracts.md` for snapshot, action, brief, and feedback objects

## Phase 1 — contracts and data model

- [x] 06. Implement `InputSnapshot` contract
- [x] 07. Implement `TopAction` contract
- [x] 08. Implement `TopThreeResult` contract
- [x] 09. Implement `DailyBrief` contract
- [x] 10. Implement `FeedbackEvent` contract

## Phase 2 — normalized inputs

- [x] 11. Build Home Assistant adapter shape and sample fixture loader
- [x] 12. Build calendar adapter shape and sample fixture loader
- [x] 13. Build chores/tasks adapter shape and sample fixture loader
- [x] 14. Add weather input normalization
- [x] 15. Add energy/solar/load normalization
- [x] 16. Create snapshot builder that merges all normalized sources

## Phase 3 — candidate generation

- [x] 17. Generate candidates from overdue chores
- [x] 18. Generate candidates from due-today chores
- [x] 19. Generate candidates from leave-by calendar pressure
- [x] 20. Generate candidates from direct schedule conflicts
- [x] 21. Generate candidates from occupancy/home anomalies
- [x] 22. Generate candidates from energy opportunity windows

## Phase 4 — ranking engine

- [x] 23. Implement weighted scoring model
- [x] 24. Implement confidence modifier
- [x] 25. Implement dedupe for near-identical actions
- [x] 26. Implement suppression rules and quiet hours handling
- [x] 27. Rank top actions and cap output at 3
- [x] 28. Add `whyNow`, reasons, and consequence-if-ignored generation

## Phase 5 — brief generation

- [x] 29. Build daily brief composer from ranked actions
- [x] 30. Add dedicated Nikolaj/person-specific task extraction
- [x] 31. Add risks/opportunities/can-wait sections
- [x] 32. Build plain JSON renderer
- [x] 33. Build Telegram text renderer
- [x] 34. Build Home Assistant payload renderer

## Phase 6 — persistence and feedback

- [x] 35. Add sqlite schema for snapshots, runs, actions, and feedback
- [x] 36. Persist engine runs with source snapshot references
- [x] 37. Persist recommendation feedback events
- [x] 38. Add simple read API for recent runs and outcomes
- [x] 39. Add suppression-memory primitives from repeated dismissals

## Phase 7 — delivery surfaces

- [x] 40. Build local run endpoint or CLI entry for top-three generation
- [x] 41. Build local run endpoint or CLI entry for daily-brief generation
- [x] 42. Build Telegram worker scheduled delivery path
- [x] 43. Build Telegram feedback handling path
- [x] 44. Build Home Assistant publisher path
- [x] 45. Add manual refresh trigger for local testing

## Phase 8 — trust and product hardening

- [ ] 46. Add missing-signal handling and degraded-mode output
- [ ] 47. Add recommendation quality fixtures and tests
- [ ] 48. Add duplicate-signal regression tests
- [ ] 49. Add explanation quality pass for terse, human output
- [ ] 50. Write onboarding/setup doc for first beta household
