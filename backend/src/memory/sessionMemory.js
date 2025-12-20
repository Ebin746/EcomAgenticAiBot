// Simple in-memory store
const sessions = {};

// Get or create session memory
export function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      lastProducts: [],
      selectedProduct: null,
    };
  }
  return sessions[sessionId];
}

// Update helpers
export function setLastProducts(sessionId, products) {
  const session = getSession(sessionId);
  session.lastProducts = products;
}

export function setSelectedProduct(sessionId, product) {
  const session = getSession(sessionId);
  session.selectedProduct = product;
}
