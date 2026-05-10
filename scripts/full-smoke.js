const fs = require('fs');
const path = require('path');
const { loadSampleSources, buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../packages/engine/src');
const { renderTelegramBrief, renderHomeAssistantPayload } = require('../packages/briefs/src');
const { createStorage } = require('../packages/storage/src');
const { runDailyBrief, recordFeedback } = require('../apps/telegram-worker/src');
const { buildHomeAssistantPackage } = require('../apps/ha-bridge/src');

async function main() {
  const stateDir = path.join(process.cwd(), 'state-smoke');
  fs.rmSync(stateDir, { recursive: true, force: true });

  const sources = loadSampleSources();
  const snapshot = buildSnapshotFromSources(sources);
  const storage = createStorage(stateDir);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  const telegramText = renderTelegramBrief(brief);
  const haPayload = renderHomeAssistantPayload(brief);
  storage.saveRun({ snapshot, result, brief, createdAt: new Date().toISOString() });
  recordFeedback({ recommendationId: result.actions[0].id, event: 'dismissed', actorId: 'nikolaj', storageDir: stateDir });
  const rerunText = await runDailyBrief(sources, { storageDir: stateDir });
  const packagePayload = await buildHomeAssistantPackage(sources, { storageDir: stateDir });

  if (!result.actions.length) throw new Error('Expected actions');
  if (!telegramText.includes('Top 3 today')) throw new Error('Missing telegram text');
  if (!haPayload.top_actions?.length) throw new Error('Missing HA payload actions');
  if (!rerunText.includes('Top 3 today')) throw new Error('Missing telegram worker output');
  if (!packagePayload.top_actions?.length) throw new Error('Missing HA bridge package');
  if (!Array.isArray(storage.listRuns()) || storage.listRuns().length < 2) throw new Error('Expected persisted runs');
  if (!Array.isArray(storage.listFeedback()) || storage.listFeedback().length < 1) throw new Error('Expected persisted feedback');

  console.log('full smoke ok');
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
