import { DynamicTool } from "@langchain/core/tools";
import { fetchProducts, fetchProductDetails } from "../services/shopify.js";

export const fetchProductsTool = new DynamicTool({
  name: "fetch_products",
  description: "Fetch products from Shopify store",
  func: async (input) => {
    const products = await fetchProducts(input);
    return JSON.stringify(products);
  }
});

export const fetchProductDetailsTool = new DynamicTool({
  name: "fetch_product_details",
  description: "Fetch detailed product information using product ID",
  func: async (productId) => {
    const details = await fetchProductDetails(productId);
    return JSON.stringify(details);
  }
});
