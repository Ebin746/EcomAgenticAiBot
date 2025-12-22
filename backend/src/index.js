import express from "express";
import "./loadEnv.js";
import { getAgent } from "./agent/agent.js";
import { sessionContext } from "./memory/sessionContext.js";

const app = express();
app.use(express.json());

const agent = getAgent();

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  sessionContext.run({ sessionId }, async () => {
    try {
      const result = await agent.invoke({
        messages: [{ role: "user", content: message }],
      });

      const lastMessage =
        result.messages?.[result.messages.length - 1];

      res.json({
        reply: lastMessage?.content ?? "No response",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
