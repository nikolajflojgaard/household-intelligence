const fs = require('fs');
const path = require('path');
const { buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree } = require('../packages/engine/src');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const fixtures = ['high-pressure-day.json', 'degraded-minimal.json', 'duplicate-signals.json'];

for (const name of fixtures) {
  const sources = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8'));
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot);

  for (const action of result.actions) {
    assert(/[.!?]$/.test(action.whyNow), `${name}: whyNow should end like a sentence for ${action.id}`);
    assert(/[.!?]$/.test(action.consequenceIfIgnored), `${name}: consequenceIfIgnored should end like a sentence for ${action.id}`);
    assert(action.reasons.length >= 1, `${name}: action should have at least one reason for ${action.id}`);
  }
}

console.log('explanation regression ok');
