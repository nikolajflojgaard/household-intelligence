const contracts = require('../packages/contracts/src');

const action = contracts.createTopAction({
  id: 'chore:dishwasher',
  title: 'Empty dishwasher',
  summary: 'Kitchen pressure increases later this morning.',
  category: 'chores',
  score: 82,
  urgency: 'high',
  confidence: 0.84,
  ownerId: 'nikolaj',
  reasons: ['It blocks the next kitchen cycle', 'Morning window is the cheapest effort slot'],
  sourceSignals: ['chore-overdue', 'kitchen-load'],
  whyNow: 'You still have a low-friction window before the day gets noisy.',
  consequenceIfIgnored: 'The kitchen stacks more friction into the afternoon.',
  actions: [{ kind: 'done', label: 'Mark done' }]
});

const snapshot = contracts.createInputSnapshot({
  generatedAt: new Date().toISOString(),
  householdId: 'home-1',
  people: [{ id: 'nikolaj', name: 'Nikolaj' }],
  chores: [{ id: 'dishwasher', title: 'Empty dishwasher' }],
  calendarEvents: []
});

const result = contracts.createTopThreeResult({
  generatedAt: snapshot.generatedAt,
  actions: [action],
  suppressedCount: 0,
  missingSources: ['weather']
});

const brief = contracts.createDailyBrief({
  generatedAt: snapshot.generatedAt,
  topActions: [action],
  nikolajTasks: [action],
  risks: ['Afternoon household load will spike if the kitchen is still blocked.'],
  opportunities: ['Use the quiet morning window to clear one high-friction chore.'],
  canWait: ['Laundry can wait until solar surplus improves.']
});

const feedback = contracts.createFeedbackEvent({
  recommendationId: action.id,
  event: 'useful',
  actorId: 'nikolaj',
  timestamp: snapshot.generatedAt
});

console.log(JSON.stringify({ snapshot, result, brief, feedback }, null, 2));
