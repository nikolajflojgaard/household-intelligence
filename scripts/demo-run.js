const path = require('path');
const { loadSampleSources, buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../packages/engine/src');
const { renderTelegramBrief, renderHomeAssistantPayload } = require('../packages/briefs/src');
const { createStorage } = require('../packages/storage/src');
const { runDailyBrief, recordFeedback } = require('../apps/telegram-worker/src');
const { buildHomeAssistantPackage } = require('../apps/ha-bridge/src');

const stateDir = path.join(process.cwd(), 'state-demo');
const storage = createStorage(stateDir);
const sources = loadSampleSources();
const snapshot = buildSnapshotFromSources(sources);
const result = buildTopThree(snapshot, { dismissalState: storage.buildDismissalState() });
const brief = buildDailyBrief(snapshot, result);

console.log('=== SNAPSHOT ===');
console.log(JSON.stringify(snapshot, null, 2));
console.log('\n=== TOP THREE ===');
console.log(JSON.stringify(result, null, 2));
console.log('\n=== TELEGRAM BRIEF ===');
console.log(renderTelegramBrief(brief));
console.log('\n=== HOME ASSISTANT PAYLOAD ===');
console.log(JSON.stringify(renderHomeAssistantPayload(brief), null, 2));
console.log('\n=== TELEGRAM WORKER RUN ===');
console.log(runDailyBrief(sources, { storageDir: stateDir }));
console.log('\n=== FEEDBACK EVENT ===');
console.log(JSON.stringify(recordFeedback({ recommendationId: result.actions[0]?.id || 'demo', event: 'useful', actorId: 'nikolaj', storageDir: stateDir }), null, 2));
console.log('\n=== HA PACKAGE BUILD ===');
console.log(JSON.stringify(buildHomeAssistantPackage(sources, { storageDir: stateDir }), null, 2));
