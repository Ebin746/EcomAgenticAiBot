// src/memory/messageHistory.js

const conversationStore = new Map();

export function getMessageHistory(sessionId) {
  if (!conversationStore.has(sessionId)) {
    conversationStore.set(sessionId, []);
  }
  return conversationStore.get(sessionId);
}

export function addMessage(sessionId, role, content) {
  const history = getMessageHistory(sessionId);
  history.push({ role, content, timestamp: Date.now() });
  
  // Keep only last 20 messages to avoid token limits
  if (history.length > 20) {
    history.shift();
  }
  
  console.log(`💬 [${role.toUpperCase()}] ${content.substring(0, 100)}...`);
}

export function clearHistory(sessionId) {
  conversationStore.delete(sessionId);
}