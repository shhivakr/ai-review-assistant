import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDataBase } from "./config/db";

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
