// src/agent/llm.js

import { ChatGroq } from "@langchain/groq";

export const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile", // Better model for structured output
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3, // Lower temperature for more consistent JSON
  maxTokens: 2048,
  topP: 1,
  streaming: false,
});

// Alternative: If you want to stick with qwen but improve consistency
// export const llm = new ChatGroq({
//   model: "qwen/qwen3-32b", 
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0.3, // Lower temp for JSON consistency
//   maxTokens: 2048,
// });