# How to Use Household Intelligence

## 1. Start simple

For local prototype work, start with smoke tests:

```bash
npm test
npm run smoke:calendar
npm run smoke:telegram
npm run smoke:ha-publish
npm run smoke:telegram-commands
```

## 2. Run a local preview

```bash
npm run demo
```

## 3. Run with live Home Assistant input

```bash
HOUSEHOLD_INTELLIGENCE_MODE=ha HOUSEHOLD_INTELLIGENCE_USE_REAL_HA=1 npm run demo
```

## 4. Turn on Telegram sending

Set env vars:

```bash
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_DRY_RUN=0
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_BOT_TOKEN=<token>
export HOUSEHOLD_INTELLIGENCE_TELEGRAM_CHAT_ID=<chat-id>
```

Then call the Telegram worker through `deliverDailyBrief()`.

## 5. Turn on Home Assistant publish-back

```bash
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_DRY_RUN=0
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENTRY_ID=<entry-id>
```

Then call `deliverHomeAssistantPackage()`.

## 6. Use Telegram feedback commands

Supported examples:

```text
/brief
/last
/useful 1
/done 2
/wrong 3
```

That creates the first real feedback loop against ranked actions.

## Recommended rollout

1. dry-run everything first
2. verify text quality
3. enable one private Telegram chat
4. enable HA publish-back
5. test daily for one real household
6. only then add scheduling and richer feedback behavior
