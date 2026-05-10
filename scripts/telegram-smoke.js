const { deliverDailyBrief } = require('../apps/telegram-worker/src');

async function main() {
  const result = await deliverDailyBrief(null, {
    telegram: {
      enabled: true,
      dryRun: true,
      chatId: 'telegram:test-chat'
    }
  });

  if (!result.text || !result.text.includes('Top 3 today')) {
    throw new Error('Expected Telegram brief text');
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
