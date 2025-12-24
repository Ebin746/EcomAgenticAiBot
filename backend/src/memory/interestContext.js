// src/memory/interestContext.js

import { getCurrentSessionId } from "./sessionContext.js";

const interestStore = new Map();

export function getUserInterest(sessionId) {
  if (!sessionId) {
    sessionId = getCurrentSessionId();
  }

  if (!interestStore.has(sessionId)) {
    return null;
  }

  return interestStore.get(sessionId);
}

export function setUserInterest(sessionId, interestData) {
  if (!sessionId) {
    sessionId = getCurrentSessionId();
  }

  interestStore.set(sessionId, interestData);

  console.log("🧠 [WRITE] Interest context:", {
    sessionId,
    interest: interestData.interest,
  });
}

export function clearUserInterest(sessionId) {
  if (!sessionId) {
    sessionId = getCurrentSessionId();
  }

  interestStore.delete(sessionId);
  console.log("🧹 [CLEAR] Interest context:", { sessionId });
}