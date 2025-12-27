# 🤖 EcomAgenticAiBot

An AI-powered conversational shopping assistant that leverages large language models and a tool-driven architecture to facilitate product browsing, selection, and draft order creation via the Shopify GraphQL API.

## Features

- 💬 **Conversational AI Assistant**: Engages users in natural language to guide through the shopping experience.
- 🛍️ **Shopify Integration**: Seamlessly connects with Shopify's GraphQL API to fetch product data and create draft orders.
- 🔍 **Dynamic Product Search**: Allows users to list and filter products based on various criteria.
- 🛒 **Intelligent Product Selection**: Retrieves detailed product information by index from previously listed items.
- 📝 **Streamlined Order Flow**: Manages a step-by-step process for confirming and creating draft orders.
- 🧠 **Contextual Memory**: Maintains session-specific conversation history, product context, and transaction states.
- 🔧 **Tool-Driven Architecture**: Utilizes LangChain tools for deterministic interaction with external APIs.
- 🛡️ **Robust Error Handling**: Provides clear feedback and graceful error recovery during agent interactions.

## Tech Stack

| Category      | Technologies                                                                                |
|:--------------|:--------------------------------------------------------------------------------------------|
| Frontend      | Next.js [nextjs], React [react], Tailwind CSS [tailwind], TypeScript [typescript], Lucide React [lucide-react] |
| Backend       | Node.js [nodejs], Express.js [expressjs], LangChain [langchain], Groq API [groq], Zod [zod], graphql-request [graphql-request] |
| Development   | ESLint [eslint], nodemon [nodemon], dotenv [dotenv]                                             |

## Quick Start

This project is divided into two main parts: a `backend` API and a `my-chat-shop` Next.js frontend.

### Prerequisites

Ensure you have the following installed:

-   Node.js (version 20.x or higher is recommended)
-   npm (Node Package Manager) or pnpm

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/EcomAgenticAiBot.git
    cd EcomAgenticAiBot
    ```

2.  Install backend dependencies:

    ```bash
    cd backend
    npm install
    ```

3.  Install frontend dependencies:

    ```bash
    cd ../my-chat-shop
    npm install
    ```

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```dotenv
GROQ_API_KEY=your_groq_api_key
SHOPIFY_STORE_URL=your-shopify-store-url.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_access_token
```

> [!NOTE]
> Obtain your `GROQ_API_KEY` from the [Groq Console](https://console.groq.com/).
> For Shopify credentials, you will need a Shopify development store and a Custom App with `read_products`, `read_draft_orders`, `write_draft_orders` permissions.

## Development

### Scripts

To run the application locally, you will need to start both the backend and frontend services.

**Backend (in `EcomAgenticAiBot/backend` directory):**

```bash
npm start
```

This will start the backend server, typically on `http://localhost:4000`.

**Frontend (in `EcomAgenticAiBot/my-chat-shop` directory):**

```bash
npm run dev
```

This will start the Next.js development server, typically on `http://localhost:3000`.

## API Reference

The backend exposes the following API endpoints:

| Method | Endpoint         | Description                                                          |
|:-------|:-----------------|:---------------------------------------------------------------------|
| `POST` | `/chat`          | Processes a user message and returns an agent response.              |
| `POST` | `/clear-history` | Clears the conversation history for a given `sessionId`.             |

## Deployment

The frontend application, built with Next.js, can be deployed to platforms like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) with minimal configuration.

The backend application, built with Node.js and Express.js, can be deployed to various cloud providers such as [Render](https://render.com/), [Heroku](https://www.heroku.com/), or any service capable of running Node.js applications. Ensure that environment variables are correctly configured in your deployment environment.


[nextjs]: https://nextjs.org
[react]: https://react.dev
[tailwind]: https://tailwindcss.com
[typescript]: https://www.typescriptlang.org
[lucide-react]: https://lucide.dev/
[nodejs]: https://nodejs.org
[expressjs]: https://expressjs.com
[langchain]: https://js.langchain.com
[groq]: https://groq.com
[zod]: https://zod.dev
[graphql-request]: https://github.com/prisma-labs/graphql-request
[eslint]: https://eslint.org
[nodemon]: https://nodemon.io
[dotenv]: https://www.npmjs.com/package/dotenv
