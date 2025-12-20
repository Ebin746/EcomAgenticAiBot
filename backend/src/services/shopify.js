import axios from "axios";

const shopify = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2024-01`,
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
    "Content-Type": "application/json"
  }
});

export async function fetchProducts(query) {
  const res = await shopify.get("/products.json", {
    params: { limit: 6 }
  });

  return res.data.products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.variants[0]?.price,
    image: p.image?.src
  }));
}

export async function fetchProductDetails(productId) {
  const res = await shopify.get(`/products/${productId}.json`);
  const p = res.data.product;

  return {
    id: p.id,
    title: p.title,
    description: p.body_html,
    variants: p.variants.map(v => ({
      id: v.id,
      price: v.price,
      available: v.available
    }))
  };
}
