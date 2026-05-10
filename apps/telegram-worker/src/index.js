const path = require('path');
const { buildSnapshotFromSources, loadSampleSources, loadSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderTelegramBrief } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');
const { createFeedbackEvent } = require('../../../packages/contracts/src');

async function runDailyBrief(sources = null, options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const resolvedSources = sources || (options.useLive ? await loadSources({ mode: 'ha', useLive: true }) : loadSampleSources());
  const snapshot = buildSnapshotFromSources(resolvedSources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  storage.saveRun({ snapshot, result, brief, createdAt: new Date().toISOString(), surface: 'telegram' });
  return renderTelegramBrief(brief);
}

function recordFeedback({ recommendationId, event, actorId, storageDir }) {
  const storage = createStorage(storageDir || path.join(process.cwd(), 'state'));
  const feedback = createFeedbackEvent({
    recommendationId,
    event,
    actorId,
    timestamp: new Date().toISOString()
  });
  storage.saveFeedback(feedback);
  return feedback;
}

module.exports = {
  runDailyBrief,
  recordFeedback
};
