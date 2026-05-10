const { deliverHomeAssistantPackage } = require('../apps/ha-bridge/src');

async function main() {
  const result = await deliverHomeAssistantPackage(null, {
    ha: {
      publishEnabled: true,
      publishDryRun: true,
      publishEntryId: 'home-brief-test-entry'
    }
  });

  if (!result.payload || !Array.isArray(result.payload.top_actions)) {
    throw new Error('Expected Home Assistant payload');
  }

  console.log(JSON.stringify({
    mode: result.mode,
    runId: result.runId,
    entryId: result.entryId,
    topActions: result.payload.top_actions.map((item) => item.title)
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
