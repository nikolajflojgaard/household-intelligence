function renderTelegramBrief(brief) {
  const lines = [];
  lines.push('Top 3 today');
  brief.topActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${action.title} — ${action.whyNow}`);
  });

  if (brief.nikolajTasks.length) {
    lines.push('');
    lines.push('Nikolaj tasks');
    brief.nikolajTasks.forEach((action) => lines.push(`- ${action.title}`));
  }

  if (brief.risks.length) {
    lines.push('');
    lines.push('Risks');
    brief.risks.forEach((item) => lines.push(`- ${item}`));
  }

  if (brief.opportunities.length) {
    lines.push('');
    lines.push('Opportunity');
    brief.opportunities.forEach((item) => lines.push(`- ${item}`));
  }

  if (brief.canWait.length) {
    lines.push('');
    lines.push('Can wait');
    brief.canWait.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join('\n');
}

function renderJson(data) {
  return JSON.stringify(data, null, 2);
}

function renderHomeAssistantPayload(brief) {
  return {
    generated_at: brief.generatedAt,
    top_actions: brief.topActions.map((action) => ({
      id: action.id,
      title: action.title,
      summary: action.summary,
      score: action.score,
      urgency: action.urgency,
      owner_id: action.ownerId || null,
      why_now: action.whyNow,
      reasons: action.reasons,
      actions: action.actions || []
    })),
    nikolaj_tasks: brief.nikolajTasks.map((action) => action.title),
    risks: brief.risks,
    opportunities: brief.opportunities,
    can_wait: brief.canWait
  };
}

module.exports = {
  renderTelegramBrief,
  renderJson,
  renderHomeAssistantPayload
};
