const fs = require('fs');
const path = require('path');
const { handleTelegramCommand } = require('../apps/telegram-worker/src');

async function main() {
  const stateDir = path.join(process.cwd(), 'state-telegram-command-smoke');
  fs.rmSync(stateDir, { recursive: true, force: true });

  const brief = await handleTelegramCommand({
    text: '/brief',
    actorId: 'nikolaj',
    storageDir: stateDir,
    telegram: { enabled: true, dryRun: true, chatId: 'telegram:test-chat' }
  });

  const feedback = await handleTelegramCommand({
    text: '/useful 1',
    actorId: 'nikolaj',
    storageDir: stateDir
  });

  const last = await handleTelegramCommand({
    text: '/last',
    actorId: 'nikolaj',
    storageDir: stateDir
  });

  if (!brief.ok || !brief.text.includes('Top 3 today')) throw new Error('Expected /brief output');
  if (!feedback.ok || !feedback.text.includes('Recorded useful')) throw new Error('Expected /useful feedback output');
  if (!last.ok || !last.text.includes('Top 3 today')) throw new Error('Expected /last output');

  console.log(JSON.stringify({
    briefType: brief.type,
    feedbackType: feedback.type,
    lastType: last.type,
    feedbackText: feedback.text
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
