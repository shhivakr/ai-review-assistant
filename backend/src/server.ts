import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDataBase } from "./config/db";
import adminAuthRoutes from "./routes/adminAuth.js";
import cookieParser from "cookie-parser";
import businessRoutes from "./routes/business.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json({ limit: "50kb" }));
/**
 * Administrator authentication routes.
 *
 * Keeping the `/api/admin` prefix here means individual route modules
 * only need to define their resource-specific paths, such as `/login`.
 */

/**
 * Parses the Cookie header and exposes cookies through req.cookies.
 *
 * The refresh token is intentionally stored in an httpOnly cookie, so the
 * frontend cannot access it directly with JavaScript.
 */
app.use(cookieParser());
app.use("/api/admin", adminAuthRoutes);
/**
 * Protected administrator business settings.
 *
 * Authentication is enforced inside the business route module so every
 * business endpoint is protected consistently.
 */
app.use("/api/admin/business", businessRoutes);
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
