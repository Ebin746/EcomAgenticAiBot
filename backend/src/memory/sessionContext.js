import { AsyncLocalStorage } from "node:async_hooks";

export const sessionContext = new AsyncLocalStorage();

export function getCurrentSessionId() {
  const store = sessionContext.getStore();
  return store?.sessionId;
}
