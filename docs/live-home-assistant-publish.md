# Live Home Assistant Publish-Back

## Purpose

Publish the generated brief payload back into Home Assistant instead of only building it locally.

## Current supported path

The HA bridge now supports:
- build-only package generation
- dry-run publish preview
- real publish to the `home_brief.publish_daily_brief_package` service

## Required env vars

```bash
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENABLED=1
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_DRY_RUN=0
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_ENTRY_ID=<home-brief-entry-id>
```

Optional:

```bash
export HOUSEHOLD_INTELLIGENCE_HA_PUBLISH_SOURCE=household-intelligence
```

## Notes

This uses the same Home Assistant base URL and token config as the live Home Assistant adapter.

## Safe test

```bash
npm run smoke:ha-publish
```

That runs the bridge in dry-run mode and proves the payload is publish-ready.

## Real publish

Use `deliverHomeAssistantPackage()` with publish enabled and dry-run off.
