function envBool(name, fallback = false) {
  const value = process.env[name];
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function loadTelegramConfig(overrides = {}) {
  return {
    enabled: overrides.enabled != null ? overrides.enabled : envBool('HOUSEHOLD_INTELLIGENCE_TELEGRAM_ENABLED', false),
    dryRun: overrides.dryRun != null ? overrides.dryRun : envBool('HOUSEHOLD_INTELLIGENCE_TELEGRAM_DRY_RUN', true),
    botToken: overrides.botToken || process.env.HOUSEHOLD_INTELLIGENCE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || null,
    chatId: overrides.chatId || process.env.HOUSEHOLD_INTELLIGENCE_TELEGRAM_CHAT_ID || null,
    disableNotification: overrides.disableNotification != null ? overrides.disableNotification : envBool('HOUSEHOLD_INTELLIGENCE_TELEGRAM_DISABLE_NOTIFICATION', false),
    replyToMessageId: overrides.replyToMessageId || process.env.HOUSEHOLD_INTELLIGENCE_TELEGRAM_REPLY_TO_MESSAGE_ID || null
  };
}

module.exports = {
  loadTelegramConfig
};
