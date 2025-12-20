export function extractIntent(message) {
  const text = message.toLowerCase();

  let intent = "list";
  let product_name = null;
  let position = null;

  // Intent detection
  if (/(buy|order|purchase)/.test(text)) {
    intent = "order";
  } else if (/(detail|details|info|information|describe)/.test(text)) {
    intent = "show_details";
  } else if (/(show|list|search|find)/.test(text)) {
    intent = "list";
  }

  // Ordinal detection
  if (/(first)/.test(text)) position = "first";
  else if (/(second)/.test(text)) position = "second";
  else if (/(third)/.test(text)) position = "third";
  else if (/(last)/.test(text)) position = "last";

  // 🚫 IMPORTANT: product_name only for non-list intents
  if (intent !== "list") {
    const cleaned = text
      .replace(/(buy|order|purchase|show|list|find|details|detail|info|information|about)/g, "")
      .replace(/(first|second|third|last)/g, "")
      .trim();

    if (cleaned.length > 2) {
      product_name = cleaned;
    }
  }

  return {
    intent,
    product_name,
    position
  };
}
