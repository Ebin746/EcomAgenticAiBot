// src/agent/tools.js
// FINAL – deterministic product memory using server-side session context

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { GraphQLClient } from "graphql-request";
import { getProductContext, setLastProductList } from "../memory/productContext.js";
import { getCurrentSessionId } from "../memory/sessionContext.js";

import {
  setPendingProduct,
  getTransactionState,
  clearPendingProduct,
} from "../memory/transactionMemory.js";

/* ======================================================
   SHOPIFY GRAPHQL CLIENT
====================================================== */

const client = new GraphQLClient(
  `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-10/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
  }
);



export const listProductsTool = new DynamicStructuredTool({
  name: "list_products",
  description:
    "List or search Shopify products. Use this when the user wants to browse products.",

  schema: z.object({
    query: z.string().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  }),

  func: async ({ query, minPrice, maxPrice }) => {
    console.log("LIST_PRODUCTS using server-side session context");

    const gql = `
      query {
  products(first: 10) {
  edges {
    node {
      title
      variants(first: 1) {
        edges {
          node {
            id
            price
          }
        }
      }
      images(first: 1) {
        edges {
          node {
            src
          }
        }
      }
    }
  }
}

      }
    `;

    const data = await client.request(gql);

    let products = data.products.edges
      .map(({ node }, index) => ({
        index: index + 1,
        variantId: node.variants.edges[0]?.node.id,
        title: node.title,
        price: Number(node.variants.edges[0]?.node.price),
        image: node.images.edges[0]?.node.src,
      }))
      .filter((p) => {
        if (minPrice !== undefined && p.price < minPrice) return false;
        if (maxPrice !== undefined && p.price > maxPrice) return false;
        return true;
      });

    // 🔐 Save products in deterministic server-side memory
    setLastProductList(products);

    return JSON.stringify(products);
  },
});


export const getProductByIndexTool = new DynamicStructuredTool({
  name: "get_product_by_index",
  description:
    "Retrieve a product from the previously listed products using its index.",

  schema: z.object({
    index: z.number().int(),
  }),

  func: async ({ index }) => {
    console.log("GET_PRODUCT using server-side session context");

    const context = getProductContext();

    // 🔒 Normalize index (LLM may send 0)
    const safeIndex = Math.max(1, index);

    const product = context.lastProductList[safeIndex - 1];

    if (!product) {
      return JSON.stringify({
        error:
          "Product not found. Please ask to list products again.",
      });
    }

    // 🧠 Save pending product for continuation ("order this")
    const sessionId = getCurrentSessionId();
    setPendingProduct(sessionId, product);

    return JSON.stringify({
      message: "Here is the selected product",
      product,
    });
  },
});


export const createDraftOrderTool = new DynamicStructuredTool({
  name: "create_draft_order",
  description:
    "Create a Shopify draft order using product variant IDs and quantities.",

  schema: z.object({
    items: z.array(
      z.object({
        id: z.string().describe("Shopify variant ID"),
        qty: z.number().int().positive(),
      })
    ),
  }),

  func: async ({ items }) => {
    console.log("CREATE_DRAFT_ORDER using server-side session context");

    const lineItems = items
      .map(
        (item) =>
          `{ variantId: "${item.id}", quantity: ${item.qty} }`
      )
      .join(",");

    const gql = `
      mutation {
        draftOrderCreate(input: { lineItems: [${lineItems}] }) {
          draftOrder {
            id
            invoiceUrl
          }
        }
      }
    `;

    const data = await client.request(gql);

    return JSON.stringify(data.draftOrderCreate.draftOrder);
  },
});



export const confirmOrderTool = new DynamicStructuredTool({
  name: "confirm_order",
  description:
    "Confirm and place an order for the previously selected product.",

  schema: z.object({
    quantity: z.number().int().positive().default(1),
  }),

  func: async ({ quantity }) => {
    console.log("CONFIRM_ORDER using server-side session context");

    const sessionId = getCurrentSessionId();
    const state = getTransactionState(sessionId);

    if (!state.pendingProduct) {
      return JSON.stringify({
        error:
          "No product selected yet. Please choose a product first.",
      });
    }

    const product = state.pendingProduct;

    // Create draft order
    const result = await createDraftOrderTool.func({
      items: [
        {
          id: product.variantId,
          qty: quantity,
        },
      ],
    });

    // Clear pending product after order
    clearPendingProduct(sessionId);

    return result;
  },
});
