// src/agent/llm.js

import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
  model: "qwen/qwen3-32b", 
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.6,
});
