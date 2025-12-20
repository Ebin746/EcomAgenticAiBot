import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createTools } from "./tools.js";
import { getSession } from "../memory/sessionMemory.js";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile", // ✅ Best Groq model for agents
  temperature: 0.7,
  apiKey: process.env.GROQ_API_KEY,
});

export async function runAgent(userMessage, sessionId) {
  const session = getSession(sessionId);
  console.log(sessionId, session, "m");

  // Inject memory into prompt
  let memoryContext = "";

  if (session.lastProducts.length > 0) {
    memoryContext += "Previously shown products:\n";
    session.lastProducts.forEach((p, i) => {
      memoryContext += `${i + 1}. ${p.title} - ₹${p.price}\n`;
    });
  }

  console.log(memoryContext);

  const agent = createReactAgent({
    llm,
    tools: createTools(sessionId),
    recursionLimit: 2, // good safety limit
  });

  const result = await agent.invoke({
    messages: [
      {
      role: "system",
  content: `
You are an eCommerce shopping assistant.

RULES:
- Use tools ONLY when necessary
- Call fetch_products ONLY to list products
- Call fetch_product_details ONLY when explicitly asked
- After using a tool ONCE, provide a final answer and STOP
- Do NOT repeatedly call tools

${memoryContext}
`
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return result.messages.at(-1).content;
}
