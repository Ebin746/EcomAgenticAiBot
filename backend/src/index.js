import express from "express";
import "./loadEnv.js";
import { getAgent } from "./agent/agent.js";
import { sessionContext } from "./memory/sessionContext.js";
import { corsMiddleware } from "./middleware/cors.js";
import { getMessageHistory, addMessage } from "./memory/messageHistory.js";

const app = express();
app.use(corsMiddleware);
app.use(express.json());

// Enable CORS for Next.js frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const agent = getAgent();

// Helper function to parse agent response
function parseAgentResponse(content) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    return parsed;
  } catch (e) {
    // If not valid JSON, try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*"message"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        // If still fails, return as plain message
        return { message: content };
      }
    }
    // Fallback to plain text response
    return { message: content };
  }
}

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  await sessionContext.run({ sessionId }, async () => {
    try {
      // 🧠 Get conversation history for this session
      const history = getMessageHistory(sessionId);
      
      // 🪟 Keep only last 10 messages (5 user + 5 assistant pairs)
      const WINDOW_SIZE = 4;
      const recentHistory = history.slice(-WINDOW_SIZE);
      
      // 📝 Build messages array with recent conversation context
      const messages = recentHistory.map(h => ({
        role: h.role,
        content: h.content
      }));
      
      // Add current user message
      messages.push({ role: "user", content: message });
      
      console.log(`💬 Session ${sessionId} - Processing with ${recentHistory.length}/${history.length} messages (window: ${WINDOW_SIZE})`);

      // 🤖 Invoke agent with recent conversation history
      const result = await agent.invoke({
        messages: messages,
      });

      const lastMessage = result.messages?.[result.messages.length - 1];
      const content = lastMessage?.content ?? "No response";

      // Parse the response
      const parsedResponse = parseAgentResponse(content);

      // 💾 Save user message and assistant response to history
      addMessage(sessionId, "user", message);
      addMessage(sessionId, "assistant", content);

      // Send structured JSON response
      res.json(parsedResponse);
    } catch (err) {
      console.error("❌ Error in /chat:", err);
      res.status(500).json({ 
        error: err.message,
        message: "Sorry, I encountered an error. Please try again."
      });
    }
  });
});

// Optional: Endpoint to clear conversation history for a session
app.post("/clear-history", async (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }
  
  const { clearHistory } = await import("./memory/messageHistory.js");
  clearHistory(sessionId);
  
  res.json({ message: "History cleared", sessionId });
});

app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});