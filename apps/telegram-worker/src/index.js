const path = require('path');
const { buildSnapshotFromSources, loadSampleSources, loadSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderTelegramBrief } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');
const { createFeedbackEvent } = require('../../../packages/contracts/src');
const { loadTelegramConfig } = require('./config');
const { sendTelegramMessage } = require('./telegram-api');

async function buildTelegramBriefRun(sources = null, options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const resolvedSources = sources || (options.useLive ? await loadSources({ mode: 'ha', useLive: true }) : loadSampleSources());
  const snapshot = buildSnapshotFromSources(resolvedSources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  const text = renderTelegramBrief(brief);
  const run = storage.saveRun({ snapshot, result, brief, text, createdAt: new Date().toISOString(), surface: 'telegram' });
  return { run, snapshot, result, brief, text };
}

async function runDailyBrief(sources = null, options = {}) {
  const { text } = await buildTelegramBriefRun(sources, options);
  return text;
}

async function deliverDailyBrief(sources = null, options = {}) {
  const telegram = loadTelegramConfig(options.telegram || {});
  const build = await buildTelegramBriefRun(sources, options);

  if (!telegram.enabled || telegram.dryRun) {
    return {
      mode: telegram.enabled ? 'dry-run' : 'disabled',
      text: build.text,
      runId: build.run.id,
      chatId: telegram.chatId || null
    };
  }

  const response = await sendTelegramMessage({
    token: telegram.botToken,
    chatId: telegram.chatId,
    text: build.text,
    disableNotification: telegram.disableNotification,
    replyToMessageId: telegram.replyToMessageId
  });

  return {
    mode: 'sent',
    text: build.text,
    runId: build.run.id,
    telegram: response.result || response
  };
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
  buildTelegramBriefRun,
  runDailyBrief,
  deliverDailyBrief,
  recordFeedback
};
