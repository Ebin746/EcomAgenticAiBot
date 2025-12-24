// src/agent/llm.js

import { ChatGroq } from "@langchain/groq";
// src/agent/llm.js - Google Gemini

// Get your free API key at: https://aistudio.google.com/app/apikey
// Free tier: 60 RPM, 1M TPM, 1500 requests/day
// export const llm = new ChatGroq({
//   model: "llama-3.3-70b-versatile", 
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0.3,
//   // CRITICAL: Explicitly bind tools format
//   modelKwargs: {
//     tool_choice: "auto", // Let model decide when to use tools
//   }
// });


export const llm = new ChatGroq({
  model: "qwen/qwen3-32b", 
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3, // Lower temp for JSON consistency
  maxTokens: 2048,
});