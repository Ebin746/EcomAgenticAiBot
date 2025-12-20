import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { createTools } from "./tools.js";
import { getSession } from "../memory/sessionMemory.js";
import { extractIntent } from "./intentExtractor.js";
import { resolveProduct } from "./productResolver.js";

// LLM is ONLY used when really needed
const llm = new ChatGroq({
  model: "llama-3.1-70b-versatile",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

export async function runAgent(userMessage, sessionId) {
  const session = getSession(sessionId);

  // ================================
  // STEP 1: Intent Extraction (Manual)
  // ================================
  const intentData = extractIntent(userMessage);
  console.log("INTENT:", intentData);

  // =====================================================
  // STEP 2: GUARD — details/order without product context
  // =====================================================
  if (
    intentData.intent !== "list" &&
    (!session.lastProducts || session.lastProducts.length === 0)
  ) {
    return "Please ask me to show products first before requesting details or ordering.";
  }

  // ==========================================
  // STEP 3: LIST PRODUCTS (NO AGENT, NO LLM)
  // ==========================================
  if (intentData.intent === "list") {
    const tools = createTools(sessionId);
    const listTool = tools.find(t => t.name === "fetch_products");

    const products = await listTool.func();

    return products;
  }

  // ==========================================
  // STEP 4: RESOLVE PRODUCT (DETERMINISTIC)
  // ==========================================
  const resolvedProduct = resolveProduct(
    intentData,
    session.lastProducts
  );

  if (!resolvedProduct) {
    return "I couldn't identify the product you're referring to. Please try again.";
  }

  // =================================================
  // STEP 5: SHOW DETAILS (DIRECT TOOL CALL, NO AGENT)
  // =================================================
  if (intentData.intent === "show_details") {
    const tools = createTools(sessionId);
    const detailsTool = tools.find(t => t.name === "fetch_product_details");

    const details = await detailsTool.func(resolvedProduct.id);

    return `Here are the details of **${resolvedProduct.title}**:\n${details}`;
  }

  // =====================================
  // STEP 6: ORDER FLOW (PLACEHOLDER SAFE)
  // =====================================
  if (intentData.intent === "order") {
    // Later: draft order + payment link
    return `✅ **${resolvedProduct.title}** has been selected for ordering.\nProceeding to checkout next.`;
  }

  // ======================================================
  // STEP 7: FALLBACK AGENT (RARE, SAFE, CONTROLLED USE)
  // ======================================================
  // This should almost never be hit, but kept for safety

  let memoryContext = "";
  if (session.lastProducts.length > 0) {
    memoryContext += "Previously shown products:\n";
    session.lastProducts.forEach((p, i) => {
      memoryContext += `${i + 1}. ${p.title} - ₹${p.price}\n`;
    });
  }

  const agent = createReactAgent({
    llm,
    tools: createTools(sessionId),
    recursionLimit: 3,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "system",
        content: `
You are an eCommerce shopping assistant.

RULES:
- Use tools ONLY for listing products
- Do NOT guess product IDs
- Stop after ONE tool call

${memoryContext}
`,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return result.messages.at(-1).content;
}
