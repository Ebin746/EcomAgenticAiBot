import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { setUserInterest } from "../memory/interestContext.js";
import { getCurrentSessionId } from "../memory/sessionContext.js";

export const mapInterestToCategoryTool = new DynamicStructuredTool({
  name: "map_interest_to_category",
  description:
    "Map user interests and web search insights into product categories and search keywords suitable for Shopify inventory lookup.",

  schema: z.object({
    interest: z.string().describe("The user's interest (e.g., 'One Piece', 'football')"),
    searchInsights: z
      .string()
      .describe("Summarized insights from web search"),
  }),

  func: async ({ interest, searchInsights }) => {
    console.log(`🎯 MAPPING interest: "${interest}"`);

    const sessionId = getCurrentSessionId();

    /**
     * Deterministic + safe mapping rules
     * (works for anime, sports, series, music, games)
     */
    const lower = interest.toLowerCase();

    let categories = ["merchandise", "apparel"];
    let keywords = [lower];
    let giftIdeas = ["t-shirt", "hoodie"];

    if (
      searchInsights.match(/anime|series|character|fandom/i)
    ) {
      categories.push("collectibles", "posters");
      keywords.push("graphic t-shirt", "anime merch");
      giftIdeas.push("poster", "figure");
    }

    if (
      searchInsights.match(/sports|football|cricket|player|team/i)
    ) {
      categories.push("sportswear", "accessories");
      keywords.push("jersey", "cap");
      giftIdeas.push("jersey", "cap");
    }

    if (
      searchInsights.match(/gaming|game|console|esports/i)
    ) {
      categories.push("gaming accessories");
      keywords.push("gaming t-shirt");
      giftIdeas.push("mousepad", "desk decor");
    }

    const mapping = {
      categories: [...new Set(categories)],
      keywords: [...new Set(keywords)],
      giftIdeas: [...new Set(giftIdeas)],
    };

    // Save interest context in session
    setUserInterest(sessionId, {
      interest,
      searchInsights,
      mapping,
      timestamp: Date.now(),
    });

    console.log("✅ MAPPED RESULT:", mapping);

    return JSON.stringify({
      interest,
      mapping,
      timestamp: Date.now(),
    });
  },
});
