const path = require('path');
const { loadSources, buildSnapshotFromSources } = require('../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../packages/engine/src');

async function main() {
  const sources = await loadSources({
    mode: 'calendar',
    calendarEnabled: true,
    calendarIcsPath: path.join(__dirname, '..', 'fixtures', 'sample-calendar.ics')
  });

  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot);
  const brief = buildDailyBrief(snapshot, result);

  if (!snapshot.calendarEvents.length) throw new Error('Expected calendar events');
  if (!result.actions.some((item) => item.category === 'family-logistics' || item.category === 'calendar')) {
    throw new Error('Expected calendar-driven action');
  }

  console.log(JSON.stringify({
    events: snapshot.calendarEvents.length,
    topActions: result.actions.map((item) => ({ id: item.id, title: item.title, category: item.category })),
    risks: brief.risks
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
