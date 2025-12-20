import "./loadEnv.js"
import express from "express";
import { runAgent } from "./agent/agent.js";


const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const reply = await runAgent(message);
  res.json({ reply });
});

app.listen(3000, () => {
  console.log("Agent running on http://localhost:3000");
});
