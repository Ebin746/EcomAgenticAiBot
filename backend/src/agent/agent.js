// src/agent/agent.js

import { createAgent } from "langchain";
import { llm } from "./llm.js";
import { SYSTEM_PROMPT } from "./utils/systemPrompt.js";
import {
  listProductsTool,
  getProductByIndexTool,
  createDraftOrderTool,
  confirmOrderTool
} from "./tools.js";
import { getMessageHistory } from "../memory/messageHistory.js";
import { getCurrentSessionId } from "../memory/sessionContext.js";

export function getAgent() {
  return createAgent({
    model: llm,
    tools: [
      listProductsTool,
      getProductByIndexTool,
      createDraftOrderTool,
      confirmOrderTool
    ],
    system: SYSTEM_PROMPT,
  });
}

export async function runAgentWithHistory(userMessage) {
  const sessionId = getCurrentSessionId();
  const history = getMessageHistory(sessionId);
  
  // Build the full conversation context
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage }
  ];
  
  // Get the agent
  const agent = getAgent();
  
  // Run the agent with full context
  const response = await agent.invoke({
    messages: messages
  });
  
  // Save to history
  const { addMessage } = await import("../memory/messageHistory.js");
  addMessage(sessionId, "user", userMessage);
  addMessage(sessionId, "assistant", response.output);
  
  return response;
}