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
import { webSearchTool } from "./webSearchTool.js";
import { mapInterestToCategoryTool } from "./interestMappingTool.js";
import { getMessageHistory } from "../memory/messageHistory.js";
import { getCurrentSessionId } from "../memory/sessionContext.js";

const tools = [
  webSearchTool,
  mapInterestToCategoryTool,
  listProductsTool,
  getProductByIndexTool,
  createDraftOrderTool,
  confirmOrderTool
];

export function getAgent() {
  // DON'T bind tools - createAgent does this automatically
  return createAgent({
    model: llm, // Pass raw LLM without binding tools
    tools: tools,
    system: SYSTEM_PROMPT,
  });
}

export async function runAgentWithHistory(userMessage) {
  const sessionId = getCurrentSessionId();
  const history = getMessageHistory(sessionId);
  
  // Build the full conversation context
  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage }
  ];
  
  try {
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
  } catch (error) {
    console.error("❌ Agent execution error:", error);
    
    // Fallback response
    return {
      output: JSON.stringify({
        message: "I apologize, but I encountered an error. Please try rephrasing your request.",
        error: error.message
      })
    };
  }
}