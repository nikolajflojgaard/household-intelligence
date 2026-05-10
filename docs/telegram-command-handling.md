# Telegram Command Handling

## Purpose

Handle inbound Telegram commands for:
- generating a brief on demand
- reading the last brief
- recording feedback against ranked actions

## Supported commands

- `/brief`
- `/last`
- `/help`
- `/done 1`
- `/useful 2`
- `/wrong 3`
- `/dismissed 1`
- `/snooze 2`
- `/feedback <1|2|3|action-id> <done|snooze|dismissed|useful|wrong>`

## How targets work

Targets can be:
- `1`, `2`, or `3` for the top-three positions from the last Telegram brief
- a full action id

## Current behavior

Feedback is attached to the most recent stored Telegram brief.
That is enough for a first useful loop.

## Limitations

- no webhook/update receiver yet
- no automatic auth layer yet
- no multi-user/session routing yet

## Smoke test

```bash
npm run smoke:telegram-commands
```
