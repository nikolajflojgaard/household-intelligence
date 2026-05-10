# Live Telegram Delivery

## Purpose

Deliver the generated daily brief into a real Telegram chat instead of only rendering text locally.

## Current path

The Telegram worker now supports:
- build-only run
- dry-run delivery
- real Telegram `sendMessage` delivery via Bot API

## Required env vars

```bash
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_DRY_RUN=0
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_BOT_TOKEN=<your-bot-token>
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_CHAT_ID=<target-chat-id>
```

Optional:

```bash
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_DISABLE_NOTIFICATION=1
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_REPLY_TO_MESSAGE_ID=123
```

## Safe local test

```bash
npm run smoke:telegram
```

That runs delivery in dry-run mode and prints the exact text that would be sent.

## Real send

Use the worker programmatically through `deliverDailyBrief()` with Telegram enabled and dry-run off.

## Current limitations

- no inbound Telegram bot handling yet
- no command routing yet
- no automatic cron wiring yet
- no secret storage helper yet beyond env vars
