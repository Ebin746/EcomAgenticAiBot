export function resolveProduct(intentData, lastProducts) {
  if (!lastProducts || lastProducts.length === 0) return null;

  const { product_name, position } = intentData;

  // 1️⃣ Highest priority: product name match
  if (product_name) {
    const match = lastProducts.find(p =>
      p.title.toLowerCase().includes(product_name.toLowerCase())
    );
    if (match) return match;
  }

  // 2️⃣ Ordinal position
  if (position) {
    if (position === "first") return lastProducts[0];
    if (position === "second") return lastProducts[1];
    if (position === "third") return lastProducts[2];
    if (position === "last") return lastProducts[lastProducts.length - 1];
  }

  return null;
}
