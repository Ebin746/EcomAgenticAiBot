// src/memory/sessionMemory.js

import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";

const histories = new Map();

export function getMessageHistory(sessionId) {
  if (!histories.has(sessionId)) {
    histories.set(sessionId, new InMemoryChatMessageHistory());
  }
  return histories.get(sessionId);
}
