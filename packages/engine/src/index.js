const {
  createTopAction,
  createTopThreeResult,
  createDailyBrief
} = require('../../contracts/src');

function toDate(value) {
  return value ? new Date(value) : null;
}

function minutesUntil(iso) {
  const date = toDate(iso);
  if (!date) return null;
  return Math.round((date.getTime() - Date.now()) / 60000);
}

function ownerName(snapshot, ownerId) {
  return snapshot.people.find((person) => person.id === ownerId)?.name || ownerId || 'Someone';
}

function overdueChoreCandidates(snapshot) {
  return snapshot.chores
    .filter((chore) => chore.status !== 'done')
    .filter((chore) => {
      const dueMinutes = minutesUntil(chore.dueAt);
      return dueMinutes != null && dueMinutes < 0;
    })
    .map((chore) => {
      const lateMinutes = Math.abs(minutesUntil(chore.dueAt));
      return createTopAction({
        id: `overdue:${chore.id}`,
        title: chore.title,
        summary: `${ownerName(snapshot, chore.assigneeId)} owns an overdue task that is already dragging into the day.`,
        category: chore.category || 'chores',
        score: Math.min(92, 70 + Math.round(lateMinutes / 20)),
        urgency: lateMinutes > 90 ? 'high' : 'medium',
        confidence: 0.86,
        ownerId: chore.assigneeId,
        reasons: [
          'This task is already overdue',
          lateMinutes > 90 ? 'Delay is compounding into the rest of the day' : 'It is easier to clear now than later'
        ],
        sourceSignals: ['task-overdue', chore.id],
        whyNow: 'This is already late, so waiting does not improve anything.',
        consequenceIfIgnored: 'It keeps stealing attention and makes the later schedule messier.',
        actions: [
          { kind: 'done', label: 'Mark done' },
          { kind: 'snooze', label: 'Snooze' }
        ]
      });
    });
}

function dueTodayChoreCandidates(snapshot) {
  return snapshot.chores
    .filter((chore) => chore.status !== 'done')
    .filter((chore) => {
      const dueMinutes = minutesUntil(chore.dueAt);
      return dueMinutes != null && dueMinutes >= 0 && dueMinutes <= 12 * 60;
    })
    .map((chore) => {
      const dueMinutes = minutesUntil(chore.dueAt);
      return createTopAction({
        id: `due-soon:${chore.id}`,
        title: chore.title,
        summary: `${ownerName(snapshot, chore.assigneeId)} has a task due later today that can still be handled in a low-friction window.`,
        category: chore.category || 'chores',
        score: dueMinutes <= 120 ? 74 : 62,
        urgency: dueMinutes <= 120 ? 'high' : 'medium',
        confidence: 0.8,
        ownerId: chore.assigneeId,
        reasons: [
          dueMinutes <= 120 ? 'Deadline is close enough to deserve attention now' : 'This is due today and should not slip into evening',
          'Small tasks are cheapest when done before schedule pressure rises'
        ],
        sourceSignals: ['task-due-today', chore.id],
        whyNow: dueMinutes <= 120 ? 'The task is entering its last safe execution window.' : 'You still have room to handle this before it becomes annoying.',
        consequenceIfIgnored: 'It is likely to collide with later household load.',
        actions: [
          { kind: 'done', label: 'Mark done' },
          { kind: 'snooze', label: 'Snooze' }
        ]
      });
    });
}

function leaveByCandidates(snapshot) {
  return snapshot.calendarEvents
    .filter((event) => event.leaveByAt)
    .filter((event) => {
      const leaveMinutes = minutesUntil(event.leaveByAt);
      return leaveMinutes != null && leaveMinutes >= 0 && leaveMinutes <= 90;
    })
    .map((event) => {
      const leaveMinutes = minutesUntil(event.leaveByAt);
      return createTopAction({
        id: `leave-by:${event.id}`,
        title: `Protect ${ownerName(snapshot, event.ownerId)}'s leave-by window`,
        summary: `${event.title} needs movement soon or the day starts slipping.`,
        category: 'calendar',
        score: leaveMinutes <= 30 ? 89 : 78,
        urgency: leaveMinutes <= 30 ? 'high' : 'medium',
        confidence: 0.9,
        ownerId: event.ownerId,
        reasons: [
          `Leave-by time is ${leaveMinutes} minutes away`,
          'Once this window is missed, downstream timing gets worse fast'
        ],
        sourceSignals: ['calendar-leave-by', event.id],
        whyNow: 'Travel and preparation time have already started to matter.',
        consequenceIfIgnored: 'The event risks turning into a rushed or late arrival.',
        actions: [
          { kind: 'details', label: 'View details' },
          { kind: 'reschedule', label: 'Reschedule' }
        ]
      });
    });
}

function scheduleConflictCandidates(snapshot) {
  const candidates = [];
  const events = [...snapshot.calendarEvents].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

  for (let i = 0; i < events.length - 1; i += 1) {
    const current = events[i];
    const next = events[i + 1];
    if (!current.ownerId || current.ownerId !== next.ownerId) continue;

    const currentEnd = new Date(current.endAt).getTime();
    const nextStart = new Date(next.startAt).getTime();
    const gapMinutes = Math.round((nextStart - currentEnd) / 60000);
    const travelMinutes = next.travelMinutes || 0;

    if (gapMinutes < 0 || gapMinutes < travelMinutes) {
      const shortage = gapMinutes < 0 ? Math.abs(gapMinutes) : travelMinutes - gapMinutes;
      candidates.push(createTopAction({
        id: `conflict:${current.id}:${next.id}`,
        title: 'Resolve schedule collision',
        summary: `${ownerName(snapshot, current.ownerId)} cannot cleanly do both ${current.title} and ${next.title}.`,
        category: 'family-logistics',
        score: 91,
        urgency: 'high',
        confidence: 0.92,
        ownerId: current.ownerId,
        reasons: [
          'Two calendar commitments are colliding',
          `${shortage} minutes of timing slack are missing`
        ],
        sourceSignals: ['calendar-conflict', current.id, next.id],
        whyNow: 'This conflict is already visible and will not fix itself later.',
        consequenceIfIgnored: 'One of the commitments will become rushed, late, or dropped.',
        actions: [
          { kind: 'details', label: 'Inspect conflict' },
          { kind: 'reschedule', label: 'Reschedule' }
        ]
      }));
    }
  }

  return candidates;
}

function dedupe(actions) {
  const seen = new Set();
  return actions.filter((action) => {
    const key = `${action.category}:${action.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTopThree(snapshot) {
  const candidates = dedupe([
    ...scheduleConflictCandidates(snapshot),
    ...leaveByCandidates(snapshot),
    ...overdueChoreCandidates(snapshot),
    ...dueTodayChoreCandidates(snapshot)
  ]).sort((a, b) => b.score - a.score);

  return createTopThreeResult({
    generatedAt: snapshot.generatedAt,
    actions: candidates.slice(0, 3),
    suppressedCount: Math.max(0, candidates.length - 3),
    missingSources: [
      snapshot.weather?.condition ? null : 'weather',
      snapshot.energyState?.priceLevel ? null : 'energy'
    ].filter(Boolean)
  });
}

function buildDailyBrief(snapshot, result = buildTopThree(snapshot)) {
  const focusPersonId = snapshot.preferences?.focusPersonId || 'nikolaj';
  const nikolajTasks = result.actions.filter((action) => action.ownerId === focusPersonId);
  const risks = [];
  const opportunities = [];
  const canWait = [];

  const conflict = result.actions.find((action) => action.category === 'family-logistics');
  if (conflict) risks.push(conflict.summary);

  const overdue = result.actions.find((action) => action.id.startsWith('overdue:'));
  if (overdue) risks.push(`Overdue drag: ${overdue.title} is still open.`);

  if (snapshot.energyState?.priceLevel === 'cheap') {
    opportunities.push('Energy is cheap right now, so short appliance tasks are unusually cheap to clear.');
  }

  const laterTasks = snapshot.chores.filter((task) => {
    const dueMinutes = minutesUntil(task.dueAt);
    return dueMinutes != null && dueMinutes > 12 * 60;
  });
  if (laterTasks[0]) {
    canWait.push(`${laterTasks[0].title} can wait until later without hurting today.`);
  }

  return createDailyBrief({
    generatedAt: snapshot.generatedAt,
    topActions: result.actions,
    nikolajTasks,
    risks,
    opportunities,
    canWait
  });
}

module.exports = {
  overdueChoreCandidates,
  dueTodayChoreCandidates,
  leaveByCandidates,
  scheduleConflictCandidates,
  buildTopThree,
  buildDailyBrief
};
