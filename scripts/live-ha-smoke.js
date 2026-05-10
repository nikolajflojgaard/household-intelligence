const { loadRuntimeConfig, loadSources, buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree } = require('../packages/engine/src');

async function main() {
  const config = loadRuntimeConfig({ mode: 'ha', useLive: true });
  if (!config.ha.token) {
    throw new Error('Missing Home Assistant token');
  }

  const sources = await loadSources({ mode: 'ha', useLive: true });
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot);

  console.log(JSON.stringify({
    householdId: snapshot.householdId,
    chores: snapshot.chores.length,
    anomalies: snapshot.homeState?.anomalies?.length || 0,
    topActions: result.actions.map((item) => ({ id: item.id, title: item.title, score: item.score }))
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
