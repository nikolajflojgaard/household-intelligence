# Scoring

## Goal

Return up to three actions that are concrete, explainable, and worth doing now.

## Base components

- urgency: overdue, due soon, leave now, active conflict
- impact: prevents stress, waste, missed deadlines, or household drift
- time sensitivity: gets worse if delayed
- agency: can the user actually act now?
- confidence: reduce weak-signal recommendations
- uniqueness: penalize duplicates or near-duplicates

## Suggested weights

- urgency: 0-40
- impact: 0-30
- time sensitivity: 0-15
- agency: 0-10
- confidence modifier: 0.6x-1.0x
- duplication penalty: 0 to -25

## Output quality rules

Bad output:
- vague lifestyle advice
- dashboard filler
- too many priorities
- duplicate recommendations

Good output:
- specific
- ranked
- blunt
- actionable
- justified
