import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000", // Next.js dev
  "https://your-frontend-domain.com" // production
];

export const corsMiddleware = cors({
  origin: function (origin, callback) {
    // allow server-to-server or curl requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
