async function haRequest({ baseUrl, token, path, method = 'GET', body = null }) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = text;
  }

  if (!response.ok) {
    throw new Error(`HA publish failed ${response.status}: ${typeof json === 'string' ? json.slice(0, 300) : JSON.stringify(json).slice(0, 300)}`);
  }

  return json;
}

async function publishDailyBriefPackage({ baseUrl, token, entryId, payload, source = 'household-intelligence' }) {
  if (!baseUrl || !token) throw new Error('Missing Home Assistant baseUrl or token');
  if (!entryId) throw new Error('Missing Home Assistant publish entry id');

  return haRequest({
    baseUrl,
    token,
    path: '/api/services/home_brief/publish_daily_brief_package?return_response=1',
    method: 'POST',
    body: {
      entry_id: entryId,
      source,
      payload
    }
  });
}

module.exports = {
  haRequest,
  publishDailyBriefPackage
};
