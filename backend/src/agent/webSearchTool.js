import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import fetch from "node-fetch";

export const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description:
    "Search the web to understand user interests, hobbies, fandoms, or topics. Use this to learn what fans of something like anime, sports, series, or games typically like.",

  schema: z.object({
    query: z.string().describe("Search query to understand the interest or topic"),
  }),

  func: async ({ query }) => {
    console.log(`🔍 TAVILY WEB SEARCH: "${query}"`);

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          search_depth: "basic",
          include_answer: true,
          include_raw_content: false,
          max_results: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Tavily request failed");
      }

      /**
       * Tavily returns:
       * - data.answer → summarized insight (BEST PART)
       * - data.results → individual sources
       */

      const insights =
        data.answer ||
        data.results
          ?.map((r) => r.content)
          .filter(Boolean)
          .join("\n");

      console.log(`✅ WEB_SEARCH insight: ${insights?.slice(0, 200)}...`);

      return JSON.stringify({
        query,
        insights,
        sources: data.results?.map((r) => r.url),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("❌ TAVILY WEB_SEARCH error:", error.message);

      return JSON.stringify({
        error: "Failed to perform web search",
        query,
      });
    }
  },
});
