const { renderJson } = require('../../../packages/briefs/src');
const { buildSnapshotFromSources, loadSampleSources } = require('../../../packages/adapters/src');
const { buildTopThree, buildDailyBrief } = require('../../../packages/engine/src');

function buildDashboardModel(sources = loadSampleSources()) {
  const snapshot = buildSnapshotFromSources(sources);
  const result = buildTopThree(snapshot);
  const brief = buildDailyBrief(snapshot, result);

  return {
    generatedAt: brief.generatedAt,
    topActions: brief.topActions,
    risks: brief.risks,
    opportunities: brief.opportunities,
    canWait: brief.canWait
  };
}

function renderDashboardModel(sources) {
  return renderJson(buildDashboardModel(sources));
}

module.exports = {
  buildDashboardModel,
  renderDashboardModel
};
