const URGENCY_LEVELS = ['low', 'medium', 'high'];
const FEEDBACK_EVENTS = ['done', 'snooze', 'dismissed', 'useful', 'wrong'];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function ensureString(value, field) {
  assert(typeof value === 'string' && value.trim().length > 0, `${field} must be a non-empty string`);
  return value;
}

function ensureOptionalString(value, field) {
  if (value == null) return value;
  return ensureString(value, field);
}

function ensureArray(value, field) {
  assert(Array.isArray(value), `${field} must be an array`);
  return value;
}

function ensureNumber(value, field) {
  assert(typeof value === 'number' && Number.isFinite(value), `${field} must be a finite number`);
  return value;
}

function ensureStringArray(value, field) {
  ensureArray(value, field).forEach((item, index) => ensureString(item, `${field}[${index}]`));
  return value;
}

function ensureOptionalArray(value, field) {
  if (value == null) return [];
  return ensureArray(value, field);
}

function createInputSnapshot(input) {
  assert(isPlainObject(input), 'InputSnapshot must be an object');

  return {
    generatedAt: ensureString(input.generatedAt, 'generatedAt'),
    householdId: ensureString(input.householdId, 'householdId'),
    people: ensureOptionalArray(input.people, 'people'),
    chores: ensureOptionalArray(input.chores, 'chores'),
    calendarEvents: ensureOptionalArray(input.calendarEvents, 'calendarEvents'),
    homeState: input.homeState ?? null,
    energyState: input.energyState ?? null,
    weather: input.weather ?? null,
    preferences: input.preferences ?? null
  };
}

function createActionOption(input) {
  assert(isPlainObject(input), 'ActionOption must be an object');

  return {
    kind: ensureString(input.kind, 'actions.kind'),
    label: ensureString(input.label, 'actions.label'),
    target: ensureOptionalString(input.target, 'actions.target')
  };
}

function createTopAction(input) {
  assert(isPlainObject(input), 'TopAction must be an object');
  assert(URGENCY_LEVELS.includes(input.urgency), `urgency must be one of: ${URGENCY_LEVELS.join(', ')}`);

  const confidence = ensureNumber(input.confidence, 'confidence');
  assert(confidence >= 0 && confidence <= 1, 'confidence must be between 0 and 1');

  return {
    id: ensureString(input.id, 'id'),
    title: ensureString(input.title, 'title'),
    summary: ensureString(input.summary, 'summary'),
    category: ensureString(input.category, 'category'),
    score: ensureNumber(input.score, 'score'),
    urgency: input.urgency,
    confidence,
    ownerId: ensureOptionalString(input.ownerId, 'ownerId'),
    reasons: ensureStringArray(input.reasons || [], 'reasons'),
    sourceSignals: ensureStringArray(input.sourceSignals || [], 'sourceSignals'),
    whyNow: ensureString(input.whyNow, 'whyNow'),
    consequenceIfIgnored: ensureOptionalString(input.consequenceIfIgnored, 'consequenceIfIgnored'),
    actions: ensureOptionalArray(input.actions, 'actions').map(createActionOption)
  };
}

function createTopThreeResult(input) {
  assert(isPlainObject(input), 'TopThreeResult must be an object');

  return {
    generatedAt: ensureString(input.generatedAt, 'generatedAt'),
    actions: ensureArray(input.actions, 'actions').map(createTopAction),
    suppressedCount: ensureNumber(input.suppressedCount ?? 0, 'suppressedCount'),
    missingSources: ensureStringArray(input.missingSources || [], 'missingSources')
  };
}

function createDailyBrief(input) {
  assert(isPlainObject(input), 'DailyBrief must be an object');

  return {
    generatedAt: ensureString(input.generatedAt, 'generatedAt'),
    topActions: ensureArray(input.topActions, 'topActions').map(createTopAction),
    nikolajTasks: ensureOptionalArray(input.nikolajTasks, 'nikolajTasks').map(createTopAction),
    risks: ensureStringArray(input.risks || [], 'risks'),
    opportunities: ensureStringArray(input.opportunities || [], 'opportunities'),
    canWait: ensureStringArray(input.canWait || [], 'canWait')
  };
}

function createFeedbackEvent(input) {
  assert(isPlainObject(input), 'FeedbackEvent must be an object');
  assert(FEEDBACK_EVENTS.includes(input.event), `event must be one of: ${FEEDBACK_EVENTS.join(', ')}`);

  return {
    recommendationId: ensureString(input.recommendationId, 'recommendationId'),
    event: input.event,
    actorId: ensureOptionalString(input.actorId, 'actorId'),
    timestamp: ensureString(input.timestamp, 'timestamp')
  };
}

module.exports = {
  URGENCY_LEVELS,
  FEEDBACK_EVENTS,
  createInputSnapshot,
  createActionOption,
  createTopAction,
  createTopThreeResult,
  createDailyBrief,
  createFeedbackEvent
};
