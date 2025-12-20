import { DynamicTool } from "@langchain/core/tools";
import { fetchProducts, fetchProductDetails } from "../services/shopify.js";
import { setLastProducts } from "../memory/sessionMemory.js";

export function createTools(sessionId) {

  const fetchProductsTool = new DynamicTool({
    name: "fetch_products",
    description: "Fetch products from Shopify store",
    func: async () => {
      const products = await fetchProducts();
      setLastProducts(sessionId, products); // 🧠 SAVE MEMORY
      return JSON.stringify(products);
    }
  });

  const fetchProductDetailsTool = new DynamicTool({
    name: "fetch_product_details",
    description: "Fetch product details using product ID",
    func: async (productId) => {
      const details = await fetchProductDetails(productId);
      return JSON.stringify(details);
    }
  });

  return [fetchProductsTool, fetchProductDetailsTool];
}
