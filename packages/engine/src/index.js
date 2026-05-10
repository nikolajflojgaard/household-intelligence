const {
  createTopAction,
  createTopThreeResult,
  createDailyBrief,
  URGENCY_LEVELS
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

function priorityWeight(priority) {
  if (priority === 'high') return 10;
  if (priority === 'low') return -4;
  return 0;
}

function confidenceModifier(confidence) {
  return Math.max(0.6, Math.min(1, confidence));
}

function urgencyLabel(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

function finalScore({ urgency = 0, impact = 0, timeSensitivity = 0, agency = 0, confidence = 0.8, duplicationPenalty = 0 }) {
  const base = urgency + impact + timeSensitivity + agency + duplicationPenalty;
  return Math.max(0, Math.round(base * confidenceModifier(confidence)));
}

function buildAction(input) {
  const score = finalScore(input.scoreParts || {});
  return createTopAction({
    ...input,
    score,
    urgency: input.urgency || urgencyLabel(score),
    confidence: input.scoreParts?.confidence ?? input.confidence ?? 0.8
  });
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
      return buildAction({
        id: `overdue:${chore.id}`,
        title: chore.title,
        summary: `${ownerName(snapshot, chore.assigneeId)} owns an overdue task that is already dragging into the day.`,
        category: chore.category || 'chores',
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
        ],
        scoreParts: {
          urgency: Math.min(40, 22 + Math.round(lateMinutes / 8)),
          impact: 22 + priorityWeight(chore.priority),
          timeSensitivity: lateMinutes > 90 ? 12 : 8,
          agency: 9,
          confidence: 0.86
        }
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
      return buildAction({
        id: `due-soon:${chore.id}`,
        title: chore.title,
        summary: `${ownerName(snapshot, chore.assigneeId)} has a task due later today that can still be handled in a low-friction window.`,
        category: chore.category || 'chores',
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
        ],
        scoreParts: {
          urgency: dueMinutes <= 120 ? 32 : 24,
          impact: 18 + priorityWeight(chore.priority),
          timeSensitivity: dueMinutes <= 120 ? 12 : 7,
          agency: 8,
          confidence: 0.8
        }
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
      return buildAction({
        id: `leave-by:${event.id}`,
        title: `Protect ${ownerName(snapshot, event.ownerId)}'s leave-by window`,
        summary: `${event.title} needs movement soon or the day starts slipping.`,
        category: 'calendar',
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
        ],
        scoreParts: {
          urgency: leaveMinutes <= 30 ? 38 : 31,
          impact: 26,
          timeSensitivity: leaveMinutes <= 30 ? 15 : 11,
          agency: 7,
          confidence: 0.9
        }
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
      candidates.push(buildAction({
        id: `conflict:${current.id}:${next.id}`,
        title: 'Resolve schedule collision',
        summary: `${ownerName(snapshot, current.ownerId)} cannot cleanly do both ${current.title} and ${next.title}.`,
        category: 'family-logistics',
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
        ],
        scoreParts: {
          urgency: 40,
          impact: 28,
          timeSensitivity: 15,
          agency: 8,
          confidence: 0.92
        }
      }));
    }
  }

  return candidates;
}

function homeAnomalyCandidates(snapshot) {
  return (snapshot.homeState?.anomalies || []).map((anomaly) => {
    const severe = anomaly.severity === 'high';
    return buildAction({
      id: `anomaly:${anomaly.id}`,
      title: anomaly.title,
      summary: anomaly.message,
      category: 'home',
      reasons: [
        severe ? 'Home state looks actively wrong' : 'Something in the house state looks off',
        'This is exactly the kind of thing that becomes background friction if ignored'
      ],
      sourceSignals: ['home-anomaly', anomaly.id, anomaly.type],
      whyNow: severe ? 'The home is already signaling an issue, not just a possibility.' : 'This is cheap to verify before it turns into noise later.',
      consequenceIfIgnored: 'It can turn into bigger household friction or wasted attention later.',
      actions: [
        { kind: 'details', label: 'Inspect' },
        { kind: 'done', label: 'Handled' }
      ],
      scoreParts: {
        urgency: severe ? 30 : 20,
        impact: severe ? 25 : 16,
        timeSensitivity: severe ? 10 : 6,
        agency: 8,
        confidence: severe ? 0.88 : 0.72
      }
    });
  });
}

function energyOpportunityCandidates(snapshot) {
  const state = snapshot.energyState;
  if (!state) return [];

  const surplus = (state.solarWatts || 0) - (state.homeLoadWatts || 0);
  const actions = [];

  if (state.priceLevel === 'cheap' && surplus > 1000) {
    actions.push(buildAction({
      id: 'energy:surplus-window',
      title: 'Use the cheap energy / solar window',
      summary: 'You have a favorable energy window right now for appliance work.',
      category: 'energy',
      reasons: [
        `Approximate solar surplus is ${surplus}W`,
        'This is a low-regret slot for energy-hungry chores'
      ],
      sourceSignals: ['energy-cheap', 'solar-surplus'],
      whyNow: 'The home can absorb useful work cheaply right now.',
      consequenceIfIgnored: 'The same task may cost more or compete with a busier house later.',
      actions: [
        { kind: 'details', label: 'Why now?' },
        { kind: 'done', label: 'Used window' }
      ],
      scoreParts: {
        urgency: 18,
        impact: 22,
        timeSensitivity: state.cheapUntil ? 12 : 8,
        agency: 9,
        confidence: 0.83
      }
    }));
  }

  if (state.priceLevel === 'expensive') {
    actions.push(buildAction({
      id: 'energy:avoid-expensive-window',
      title: 'Delay flexible appliance work',
      summary: 'Energy is expensive now, so flexible tasks should wait if possible.',
      category: 'energy',
      reasons: [
        'Current energy price is unfavorable',
        'This is a clean opportunity to avoid dumb timing'
      ],
      sourceSignals: ['energy-expensive'],
      whyNow: 'The penalty for doing flexible work right now is immediate.',
      consequenceIfIgnored: 'You spend more for no real gain.',
      actions: [
        { kind: 'snooze', label: 'Wait for cheaper slot' }
      ],
      scoreParts: {
        urgency: 16,
        impact: 18,
        timeSensitivity: 11,
        agency: 7,
        confidence: 0.77
      }
    }));
  }

  return actions;
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

function inQuietHours(snapshot) {
  const quietHours = snapshot.homeState?.quietHours;
  if (!quietHours?.start || !quietHours?.end) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMinute] = quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = quietHours.end.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function applySuppression(actions, snapshot, dismissalState = {}) {
  const quiet = inQuietHours(snapshot);
  const kept = [];
  let suppressedCount = 0;

  for (const action of actions) {
    const dismissals = dismissalState[action.id]?.dismissedCount || 0;
    const recentlyDismissed = dismissals >= 2;
    const lowConfidence = action.confidence < 0.7;
    const nonUrgent = action.urgency !== 'high';
    const quietSuppressed = quiet && nonUrgent && action.category !== 'home';

    if ((lowConfidence && nonUrgent) || recentlyDismissed || quietSuppressed) {
      suppressedCount += 1;
      continue;
    }

    kept.push(action);
  }

  return { kept, suppressedCount };
}

function buildCandidateSet(snapshot) {
  return dedupe([
    ...scheduleConflictCandidates(snapshot),
    ...leaveByCandidates(snapshot),
    ...overdueChoreCandidates(snapshot),
    ...dueTodayChoreCandidates(snapshot),
    ...homeAnomalyCandidates(snapshot),
    ...energyOpportunityCandidates(snapshot)
  ]).sort((a, b) => b.score - a.score);
}

function buildTopThree(snapshot, options = {}) {
  const allCandidates = buildCandidateSet(snapshot);
  const { kept, suppressedCount } = applySuppression(allCandidates, snapshot, options.dismissalState || {});

  return createTopThreeResult({
    generatedAt: snapshot.generatedAt,
    actions: kept.slice(0, 3),
    suppressedCount: suppressedCount + Math.max(0, kept.length - 3),
    missingSources: [
      snapshot.weather?.condition ? null : 'weather',
      snapshot.energyState?.priceLevel ? null : 'energy',
      snapshot.homeState ? null : 'home'
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

  const anomaly = result.actions.find((action) => action.category === 'home');
  if (anomaly && anomaly.urgency === 'high') risks.push(anomaly.summary);

  const energy = result.actions.find((action) => action.category === 'energy');
  if (energy) opportunities.push(energy.summary);
  else if (snapshot.energyState?.priceLevel === 'cheap') opportunities.push('Energy is cheap right now, so flexible household work is unusually cheap to clear.');

  const laterTasks = snapshot.chores.filter((task) => {
    const dueMinutes = minutesUntil(task.dueAt);
    return dueMinutes != null && dueMinutes > 12 * 60;
  });
  if (laterTasks[0]) canWait.push(`${laterTasks[0].title} can wait until later without hurting today.`);

  if (!canWait.length && result.actions.length && result.actions.every((action) => action.urgency === 'high')) {
    canWait.push('Nothing obvious should be deferred right now.');
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
  URGENCY_LEVELS,
  overdueChoreCandidates,
  dueTodayChoreCandidates,
  leaveByCandidates,
  scheduleConflictCandidates,
  homeAnomalyCandidates,
  energyOpportunityCandidates,
  buildCandidateSet,
  applySuppression,
  buildTopThree,
  buildDailyBrief
};
