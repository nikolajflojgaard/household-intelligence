const { loadSampleSources, buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../packages/engine/src');
const { renderTelegramBrief } = require('../packages/briefs/src');

const sources = loadSampleSources();
const snapshot = buildSnapshotFromSources(sources);
const result = buildTopThree(snapshot);
const brief = buildDailyBrief(snapshot, result);

console.log('=== SNAPSHOT ===');
console.log(JSON.stringify(snapshot, null, 2));
console.log('\n=== TOP THREE ===');
console.log(JSON.stringify(result, null, 2));
console.log('\n=== TELEGRAM BRIEF ===');
console.log(renderTelegramBrief(brief));
