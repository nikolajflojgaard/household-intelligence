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

module.exports = {
  renderTelegramBrief
};
