const cache = new Map();
const TTL = 15 * 60 * 1000;

export function getCachedReport(username) {
  const entry = cache.get(username);
  if (!entry) return null;

  if (Date.now() > entry.expires) {
    cache.delete(username);
    return null;
  }

  return entry.data;
}

export function setCachedReport(username, data) {
  cache.set(username, {
    data,
    expires: Date.now() + TTL,
  });
}
