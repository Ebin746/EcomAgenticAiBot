// src/memory/productContext.js

import { getCurrentSessionId } from "./sessionContext.js";

const productStore = new Map();

export function getProductContext() {
  const sessionId = getCurrentSessionId();

  if (!sessionId) {
    console.error("❌ No sessionId in AsyncLocalStorage");
    return { lastProductList: [] };
  }

  if (!productStore.has(sessionId)) {
    productStore.set(sessionId, { lastProductList: [] });
  }

  const ctx = productStore.get(sessionId);

  // 🔍 LOG READ
  console.log("🧠 [READ] Product memory:", {
    sessionId,
    count: ctx.lastProductList.length,
  });

  return ctx;
}

export function setLastProductList(products) {
  const sessionId = getCurrentSessionId();

  if (!sessionId) {
    console.error("❌ Cannot save products — no sessionId");
    return;
  }

  productStore.set(sessionId, {
    lastProductList: products,
  });

  // 🔍 LOG WRITE
  console.log("🧠 [WRITE] Product memory:", {
    sessionId,
    count: products.length,
    titles: products.map((p) => p.title),
  });
}
