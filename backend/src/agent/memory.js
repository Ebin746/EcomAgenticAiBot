const sessions = new Map();

export function getMemory(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      lastProducts: [],
    });
  }
  return sessions.get(sessionId);
}
