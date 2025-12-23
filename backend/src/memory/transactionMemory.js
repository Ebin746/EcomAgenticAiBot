// src/memory/transactionMemory.js

const transactionStore = new Map();

export function getTransactionState(sessionId) {
  if (!transactionStore.has(sessionId)) {
    transactionStore.set(sessionId, {
      pendingProduct: null,
    });
  }
  return transactionStore.get(sessionId);
}

export function setPendingProduct(sessionId, product) {
  const state = getTransactionState(sessionId);
  state.pendingProduct = product;
}

export function clearPendingProduct(sessionId) {
  const state = getTransactionState(sessionId);
  state.pendingProduct = null;
}
