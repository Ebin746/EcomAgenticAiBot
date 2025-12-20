import "./loadEnv.js"

import express from "express";
import crypto from "crypto";
import { runAgent } from "./agent/agent.js";

const app = express();
app.use(express.json());

// Simple session generator
app.use((req, res, next) => {
  req.sessionId = "TEST_SESSION";
  next();
});


app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const reply = await runAgent(message, req.sessionId);
  res.json({ reply });
});

app.listen(3000, () => {
  console.log("Agent with memory running on http://localhost:3000");
});
