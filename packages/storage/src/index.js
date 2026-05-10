const fs = require('fs');
const path = require('path');

const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createStorage(baseDir) {
  const root = baseDir || path.join(process.cwd(), 'state');
  const runsFile = path.join(root, 'runs.json');
  const feedbackFile = path.join(root, 'feedback.json');

  function listRuns() {
    return readJson(runsFile, []);
  }

  function saveRun(run) {
    const runs = listRuns();
    const enriched = {
      id: run.id || createId('run'),
      snapshotId: run.snapshotId || createId('snapshot'),
      ...run
    };
    runs.push(enriched);
    writeJson(runsFile, runs);
    return enriched;
  }

  function listFeedback() {
    return readJson(feedbackFile, []);
  }

  function saveFeedback(event) {
    const events = listFeedback();
    const enriched = { id: event.id || createId('feedback'), ...event };
    events.push(enriched);
    writeJson(feedbackFile, events);
    return enriched;
  }

  function buildDismissalState() {
    const state = {};
    for (const event of listFeedback()) {
      if (!state[event.recommendationId]) {
        state[event.recommendationId] = { dismissedCount: 0, usefulCount: 0, doneCount: 0 };
      }
      if (event.event === 'dismissed' || event.event === 'wrong') state[event.recommendationId].dismissedCount += 1;
      if (event.event === 'useful') state[event.recommendationId].usefulCount += 1;
      if (event.event === 'done') state[event.recommendationId].doneCount += 1;
    }
    return state;
  }

  return {
    root,
    schemaSql,
    listRuns,
    saveRun,
    listFeedback,
    saveFeedback,
    buildDismissalState
  };
}

module.exports = {
  schemaSql,
  createStorage
};
