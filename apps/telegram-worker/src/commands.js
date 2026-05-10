const FEEDBACK_EVENTS = new Set(['done', 'snooze', 'dismissed', 'useful', 'wrong']);

function normalizeCommand(text) {
  return String(text || '').trim();
}

function parseTelegramCommand(text) {
  const input = normalizeCommand(text);
  if (!input) return { kind: 'empty' };

  const [head, ...rest] = input.split(/\s+/);
  const command = head.toLowerCase();

  if (command === '/brief') {
    return { kind: 'brief' };
  }

  if (command === '/help') {
    return { kind: 'help' };
  }

  if (command === '/last') {
    return { kind: 'last' };
  }

  if (command === '/feedback') {
    const [target, event] = rest;
    if (!target || !event) {
      return { kind: 'invalid', reason: 'Usage: /feedback <1|2|3|action-id> <done|snooze|dismissed|useful|wrong>' };
    }
    if (!FEEDBACK_EVENTS.has(event)) {
      return { kind: 'invalid', reason: 'Unknown feedback event' };
    }
    return { kind: 'feedback', target, event };
  }

  if (['/done', '/useful', '/wrong', '/dismissed', '/snooze'].includes(command)) {
    const [target] = rest;
    const event = command.slice(1);
    if (!target) {
      return { kind: 'invalid', reason: `Usage: ${command} <1|2|3|action-id>` };
    }
    return { kind: 'feedback', target, event };
  }

  return { kind: 'unknown', input };
}

function helpText() {
  return [
    'Commands',
    '/brief - generate a fresh brief',
    '/last - show the last generated brief',
    '/done 1 - mark top action 1 done',
    '/useful 2 - mark top action 2 useful',
    '/wrong 3 - mark top action 3 wrong',
    '/feedback <1|2|3|action-id> <done|snooze|dismissed|useful|wrong>'
  ].join('\n');
}

module.exports = {
  FEEDBACK_EVENTS,
  parseTelegramCommand,
  helpText
};
