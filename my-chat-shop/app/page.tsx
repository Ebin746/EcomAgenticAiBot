'use client';

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { Send, ShoppingBag, Loader2, ExternalLink } from 'lucide-react';

/* ================= TYPES ================= */

type MessageType =
  | 'user'
  | 'bot_text'
  | 'bot_products'
  | 'bot_product'
  | 'bot_order';

interface Product {
  index: number;
  title: string;
  price: number;
  image?: string;
  variantId?: string;
}

interface Order {
  id?: string;
  invoiceUrl?: string;
}

interface Message {
  type: MessageType;
  content?: string;
  products?: Product[];
  product?: Product;
  order?: Order;
  timestamp: Date;
}

interface ChatResponse {
  message?: string;
  products?: Product[];
  product?: Product;
  order?: Order;
}

/* ================= MAIN COMPONENT ================= */

export default function ChatCommerce() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot_text',
      content:
        "👋 Hi! I'm your shopping assistant. Ask me about products, prices, or orders.",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data: ChatResponse = await res.json();

      const botMessage: Message = {
        type: 'bot_text',
        content: data.message ?? 'Here you go 👇',
        timestamp: new Date(),
      };

      if (data.products) {
        botMessage.type = 'bot_products';
        botMessage.products = data.products;
      } else if (data.product) {
        botMessage.type = 'bot_product';
        botMessage.product = data.product;
      } else if (data.order) {
        botMessage.type = 'bot_order';
        botMessage.order = data.order;
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot_text',
          content: '❌ Something went wrong. Try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold">ShopBot</h1>
            <p className="text-xs text-slate-400">
              {isLoading ? 'Typing…' : 'Online'}
            </p>
          </div>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* INPUT */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-2">
          <textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={onKeyDown}
            placeholder="Ask about shoes, shirts, prices…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function MessageBubble({ message }: { message: Message }) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-2xl rounded-tr-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message.content && (
        <div className="max-w-[85%] bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-sm">
          {message.content}
        </div>
      )}

      {message.products && <ProductCarousel products={message.products} />}
      {message.product && (
        <ProductCard product={message.product} expanded />
      )}
      {message.order && <OrderCard order={message.order} />}
    </div>
  );
}

function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {products.map((p) => (
        <ProductCard key={p.index} product={p} />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  expanded = false,
}: {
  product: Product;
  expanded?: boolean;
}) {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl shadow-lg ${
        expanded ? 'w-full' : 'w-64 flex-shrink-0'
      }`}
    >
      <div className="h-40 bg-slate-900 flex items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-slate-600" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-slate-100 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-indigo-400 font-bold">
          ₹{product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4">
      <p className="font-semibold text-emerald-300 mb-2">
        ✅ Order Created
      </p>
      {order.invoiceUrl && (
        <a
          href={order.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-emerald-200 underline"
        >
          Complete Purchase <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
