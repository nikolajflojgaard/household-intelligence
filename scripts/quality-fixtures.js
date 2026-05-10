const fs = require('fs');
const path = require('path');
const { buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../packages/engine/src');

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runFixture(name, check) {
  const sources = loadFixture(name);
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot);
  const brief = buildDailyBrief(snapshot, result);
  check({ snapshot, result, brief });
}

runFixture('high-pressure-day.json', ({ result, brief }) => {
  assert(result.actions.length >= 2, 'high-pressure-day should produce multiple actions');
  assert(result.actions[0].category === 'family-logistics', 'high-pressure-day should prioritize logistics conflict first');
  assert(brief.risks.length >= 1, 'high-pressure-day should include a risk');
});

runFixture('degraded-minimal.json', ({ result, brief }) => {
  assert(result.actions.length >= 1, 'degraded fixture should still produce one action');
  assert(result.missingSources.includes('calendar'), 'degraded fixture should report missing calendar');
  assert(brief.opportunities.some((line) => line.includes('Degraded mode')), 'degraded fixture should mention degraded mode');
});

runFixture('duplicate-signals.json', ({ result }) => {
  const dishwasherCount = result.actions.filter((action) => action.title === 'Empty dishwasher').length;
  assert(dishwasherCount === 1, 'duplicate signals should be deduped to one action');
});

console.log('quality fixtures ok');
