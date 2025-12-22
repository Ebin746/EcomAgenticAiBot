// src/agent/agent.js

import { createAgent } from "langchain";
import { llm } from "./llm.js";
import { SYSTEM_PROMPT } from "./utils/systemPrompt.js";
import {
  listProductsTool,
  getProductByIndexTool,
  createDraftOrderTool,
} from "./tools.js";

export function getAgent() {
  return createAgent({
    model: llm,
    tools: [
      listProductsTool,
      getProductByIndexTool,
      createDraftOrderTool,
    ],
    system: SYSTEM_PROMPT,
  });
}
