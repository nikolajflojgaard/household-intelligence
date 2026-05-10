# Home Assistant Publish Setup Notes

## Needed

- Home Assistant long-lived token
- Home Assistant base URL
- the target Home Brief entry id

## Current strategy

Start with dry-run mode first.
Only enable real publishing after confirming the payload content looks right.

## What this is for

This is the publish-back half of the Home Brief loop:
- collect signals
- rank actions
- build brief payload
- publish back into Home Assistant
