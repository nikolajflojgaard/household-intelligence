# First Beta Household Onboarding

## Goal

Get one real household running on the system with enough signal quality that the output can be judged honestly.

This is not a broad public onboarding flow.
It is a founder-led beta setup.

## What you need

- one household willing to test daily output for 1-2 weeks
- Home Assistant access or exported household signal data
- basic calendar data
- a task/chores source, even if crude
- one delivery surface: Telegram is enough to start

## Minimum data needed

### Required
- people in household
- tasks/chores with assignee + due time if possible
- calendar events for at least the focus person

### Very useful
- leave-by or travel context
- occupancy/home mode
- energy price / solar / load
- notable house anomalies

## Setup steps

### 1. Define the focus household
Capture:
- household id
- people ids/names
- focus person id
- quiet hours

### 2. Wire raw sources
Start ugly if needed.
Even JSON exports are fine for the first beta.

Need at least:
- tasks
- calendar

Preferably also:
- HA home state
- energy state
- weather

### 3. Run local snapshot build
Use the adapters layer to normalize the source data into one `InputSnapshot`.

### 4. Inspect top-3 output manually
Before sending anything to the tester, read the output yourself.
If it looks dumb, fix the engine before blaming the user.

### 5. Deliver one brief per day
Start with one reliable morning brief.
Do not spam.
Do not over-automate too early.

### 6. Capture feedback
For every bad recommendation, ask:
- what made this wrong?
- what context was missing?
- was the ranking wrong or the data wrong?

## What success looks like

Within the first week, the tester should say at least one of these:
- this helped me decide faster
- this caught a conflict early
- this told me to do the right thing at the right time
- this prevented friction

If they only say “pretty cool,” that is not success.

## What to avoid

- too many recommendations
- vague AI language
- too much setup burden
- trying to support every edge case at once
- hiding weak output behind fancy UI

## Founder checklist

Before calling the beta live:
- output is short
- output is concrete
- output includes reasons
- output includes consequence of ignoring
- degraded mode is explicit when signals are missing
- feedback capture works

## Next step after first beta

Once one household gets useful output consistently:
- wire real HA reads
- wire real Telegram actions
- improve suppression from feedback
- add second household only after the first one is genuinely useful
