# Next Phase

## What is real now

- live Home Assistant REST reads
- keychain/env config loading
- real household task/weather/solar/home-mode ingestion
- prototype decision engine on top of those signals

## What still needs to become real

1. live calendar adapter
2. real Telegram delivery plumbing
3. real Home Assistant publish-back path
4. proper sqlite runtime instead of JSON persistence
5. better per-household configuration model

## Correct priority

Do not add random features first.

Do this order:
1. calendar
2. Telegram
3. publish-back
4. real persistence
5. user tuning
