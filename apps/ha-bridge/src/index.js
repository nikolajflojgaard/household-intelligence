const path = require('path');
const { buildSnapshotFromSources, loadSampleSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderHomeAssistantPayload } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');

function buildHomeAssistantPackage(sources = loadSampleSources(), options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  const payload = renderHomeAssistantPayload(brief);
  storage.saveRun({ snapshot, result, brief, payload, createdAt: new Date().toISOString(), surface: 'home-assistant' });
  return payload;
}

module.exports = {
  buildHomeAssistantPackage
};
