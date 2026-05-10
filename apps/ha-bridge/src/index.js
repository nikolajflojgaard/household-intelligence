const path = require('path');
const { buildSnapshotFromSources, loadSampleSources, loadSources, loadRuntimeConfig } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');
const { renderHomeAssistantPayload } = require('../../../packages/briefs/src');
const { createStorage } = require('../../../packages/storage/src');
const { publishDailyBriefPackage } = require('./home-assistant-publish');

async function buildHomeAssistantPackage(sources = null, options = {}) {
  const storage = createStorage(options.storageDir || path.join(process.cwd(), 'state'));
  const resolvedSources = sources || (options.useLive ? await loadSources({ mode: 'ha', useLive: true }) : loadSampleSources());
  const snapshot = buildSnapshotFromSources(resolvedSources);
  const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
  const brief = buildDailyBrief(snapshot, result);
  const payload = renderHomeAssistantPayload(brief);
  const run = storage.saveRun({ snapshot, result, brief, payload, createdAt: new Date().toISOString(), surface: 'home-assistant' });
  return { run, snapshot, result, brief, payload };
}

async function deliverHomeAssistantPackage(sources = null, options = {}) {
  const config = loadRuntimeConfig(options.ha || {});
  const build = await buildHomeAssistantPackage(sources, options);

  if (!config.ha.publishEnabled || config.ha.publishDryRun) {
    return {
      mode: config.ha.publishEnabled ? 'dry-run' : 'disabled',
      runId: build.run.id,
      entryId: config.ha.publishEntryId,
      payload: build.payload
    };
  }

  const published = await publishDailyBriefPackage({
    baseUrl: config.ha.baseUrl,
    token: config.ha.token,
    entryId: config.ha.publishEntryId,
    payload: build.payload,
    source: config.ha.publishSource
  });

  return {
    mode: 'sent',
    runId: build.run.id,
    entryId: config.ha.publishEntryId,
    payload: build.payload,
    published
  };
}

module.exports = {
  buildHomeAssistantPackage,
  deliverHomeAssistantPackage
};
