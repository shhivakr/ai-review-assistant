import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDataBase } from "./config/db";
import adminAuthRoutes from "./routes/adminAuth.js";
import cookieParser from "cookie-parser";
import businessRoutes from "./routes/business.js";
import questionRoutes from "./routes/questions.js";
import dashboardRoutes from "./routes/dashboard.js";
import publicRoutes from "./routes/public.js";

dotenv.config();

function validateEnv() {
  const required = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "GEMINI_API_KEY",
    "FRONTEND_URL",
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "production") {
      console.error(`Missing required environment variables for production: ${missing.join(", ")}`);
      process.exit(1);
    } else {
      console.warn(`Warning: Missing environment variables: ${missing.join(", ")}`);
    }
  }
}

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "50kb" }));

app.use(cookieParser());
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/business", businessRoutes);
app.use("/api/admin/questions", questionRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

/* ======== Public customer-facing routes No authentication is applied here. ======== */

app.use("/api/public", publicRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-review-assistant-api",
  });
});

async function startServer() {
  try {
    await connectDataBase();
    app.listen(PORT, () => {
      console.log(`API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit the process with an error code
  }
}

startServer();
