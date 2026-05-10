const path = require('path');
const { buildSnapshotFromSources, loadSampleSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderTelegramBrief } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');
const { createFeedbackEvent } = require('../../../packages/contracts/src');

function runDailyBrief(sources = loadSampleSources(), options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  storage.saveRun({ snapshot, result, brief, createdAt: new Date().toISOString() });
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
