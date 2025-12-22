// src/agent/agent.js

import { createAgent } from "langchain";
import { llm } from "./llm.js";
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
    system: `
You are an AI shopping assistant.

CRITICAL:
- A sessionId will always be provided at runtime.
- You MUST include sessionId in EVERY tool call.
- Product memory depends on sessionId.
- Never call tools without sessionId.

Tool usage examples (FOLLOW THIS FORMAT):

list_products({
  "sessionId": "<SESSION_ID>",
  "query": "snowboard"
})

get_product_by_index({
  "sessionId": "<SESSION_ID>",
  "index": 2
})

create_draft_order({
  "items": [{ "id": "<VARIANT_ID>", "qty": 1 }]
})

If sessionId is missing, the tool call is INVALID.
`,
  });
}
