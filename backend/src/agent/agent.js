import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { fetchProductsTool, fetchProductDetailsTool } from "./tools.js";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",   // ✅ FIXED
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function runAgent(userMessage) {
  const agent = createReactAgent({
    llm,
    tools: [fetchProductsTool, fetchProductDetailsTool],
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: userMessage }],
  });

  return result.messages.at(-1).content;
}
