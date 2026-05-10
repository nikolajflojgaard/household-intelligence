const path = require('path');
const { buildSnapshotFromSources, loadSampleSources, loadSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderHomeAssistantPayload } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');

async function buildHomeAssistantPackage(sources = null, options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const resolvedSources = sources || (options.useLive ? await loadSources({ mode: 'ha', useLive: true }) : loadSampleSources());
  const snapshot = buildSnapshotFromSources(resolvedSources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  const payload = renderHomeAssistantPayload(brief);
  storage.saveRun({ snapshot, result, brief, payload, createdAt: new Date().toISOString(), surface: 'home-assistant' });
  return payload;
}

module.exports = {
  buildHomeAssistantPackage
};
