"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

/* ================= TYPES ================= */

interface Product {
  index: number;
  title: string;
  price: number;
  image?: string;
  variantId?: string;
  description?: string;
}

interface Order {
  id?: string;
  invoiceUrl?: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
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
      type: 'bot',
      content: "Hi! I'm your shopping assistant. Ask me about products, prices, or orders.",
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

  // Clean markdown formatting from text
  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italics
      .replace(/!\[.*?\]\(.*?\)/g, '')    // Remove image links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Convert [text](url) to text
      .replace(/#{1,6}\s+/g, '')          // Remove headers
      .trim();
  };

  const formatProductList = (products: Product[]): string => {
    return products.map((p) => {
      let text = `${p.index}. ${p.title} - ₹${p.price.toFixed(2)}`;
      if (p.description) {
        text += `\n   ${p.description}`;
      }
      return text;
    }).join('\n\n');
  };

  const formatSingleProduct = (product: Product): string => {
    let text = `${product.title}\nPrice: ₹${product.price.toFixed(2)}`;
    if (product.description) {
      text += `\n\n${product.description}`;
    }
    return text;
  };

  const formatOrder = (order: Order): string => {
    let text = '✓ Order created successfully!';
    if (order.invoiceUrl) {
      text += `\n\nComplete your purchase:\n${order.invoiceUrl}`;
    }
    return text;
  };

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

      let botContent = data.message ? cleanText(data.message) : '';

      // Convert products/product/order to text
      if (data.products && data.products.length > 0) {
        const productText = formatProductList(data.products);
        botContent = botContent ? `${botContent}\n\n${productText}` : productText;
      } else if (data.product) {
        const productText = formatSingleProduct(data.product);
        botContent = botContent ? `${botContent}\n\n${productText}` : productText;
      } else if (data.order) {
        const orderText = formatOrder(data.order);
        botContent = botContent ? `${botContent}\n\n${orderText}` : orderText;
      }

      const botMessage: Message = {
        type: 'bot',
        content: botContent || 'Here you go',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'Something went wrong. Try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="font-semibold text-lg">ShopBot</h1>
          <p className="text-xs text-slate-400">
            {isLoading ? 'Typing…' : 'Online'}
          </p>
        </div>
      </header>

      {/* CHAT */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full space-y-4">
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
        <div className="max-w-3xl mx-auto px-4 py-4 flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about products, prices, orders…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg bg-slate-800 border border-slate-700 p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ================= MESSAGE BUBBLE ================= */

function MessageBubble({ message }: { message: Message }) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-md">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 rounded-2xl rounded-tl-md">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</pre>
      </div>
    </div>
  );
}