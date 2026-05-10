async function telegramRequest(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram API failed: ${response.status} ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

async function sendTelegramMessage({ token, chatId, text, disableNotification = false, replyToMessageId = null }) {
  if (!token) throw new Error('Missing Telegram bot token');
  if (!chatId) throw new Error('Missing Telegram chat id');
  if (!text) throw new Error('Missing Telegram message text');

  return telegramRequest(token, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_notification: disableNotification,
    reply_parameters: replyToMessageId ? { message_id: Number(replyToMessageId) } : undefined
  });
}

module.exports = {
  telegramRequest,
  sendTelegramMessage
};
