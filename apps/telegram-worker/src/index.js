const path = require('path');
const { buildSnapshotFromSources, loadSampleSources, loadSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderTelegramBrief } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');
const { createFeedbackEvent } = require('../../../packages/contracts/src');
const { loadTelegramConfig } = require('./config');
const { sendTelegramMessage } = require('./telegram-api');
const { parseTelegramCommand, helpText } = require('./commands');

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

function getLastTelegramRun(storageDir) {
  const storage = createStorage(storageDir || path.join(process.cwd(), 'state'));
  const runs = storage.listRuns().filter((run) => run.surface === 'telegram');
  return runs[runs.length - 1] || null;
}

function resolveActionTarget(run, target) {
  if (!run?.result?.actions?.length) return null;
  if (/^[123]$/.test(String(target))) {
    return run.result.actions[Number(target) - 1] || null;
  }
  return run.result.actions.find((action) => action.id === target) || null;
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

async function handleTelegramCommand({ text, actorId = 'telegram-user', storageDir, useLive = false, telegram = {} }) {
  const command = parseTelegramCommand(text);

  if (command.kind === 'empty') {
    return { ok: true, type: 'noop', text: 'Empty command.' };
  }

  if (command.kind === 'help') {
    return { ok: true, type: 'help', text: helpText() };
  }

  if (command.kind === 'brief') {
    const result = await deliverDailyBrief(null, { storageDir, useLive, telegram });
    return { ok: true, type: 'brief', text: result.text, meta: result };
  }

  if (command.kind === 'last') {
    const run = getLastTelegramRun(storageDir);
    if (!run) return { ok: false, type: 'last', text: 'No previous Telegram brief found yet.' };
    return { ok: true, type: 'last', text: run.text, meta: { runId: run.id } };
  }

  if (command.kind === 'feedback') {
    const run = getLastTelegramRun(storageDir);
    if (!run) return { ok: false, type: 'feedback', text: 'No Telegram brief found to attach feedback to yet.' };
    const action = resolveActionTarget(run, command.target);
    if (!action) return { ok: false, type: 'feedback', text: `Could not resolve action target: ${command.target}` };
    const saved = recordFeedback({
      recommendationId: action.id,
      event: command.event,
      actorId,
      storageDir
    });
    return {
      ok: true,
      type: 'feedback',
      text: `Recorded ${command.event} for: ${action.title}`,
      meta: { feedbackId: saved.id, recommendationId: action.id }
    };
  }

  if (command.kind === 'invalid') {
    return { ok: false, type: 'invalid', text: command.reason };
  }

  return { ok: false, type: 'unknown', text: `Unknown command: ${text}\n\n${helpText()}` };
}

module.exports = {
  buildTelegramBriefRun,
  getLastTelegramRun,
  runDailyBrief,
  deliverDailyBrief,
  recordFeedback,
  handleTelegramCommand
};
