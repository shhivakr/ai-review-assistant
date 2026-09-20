import rateLimit from "express-rate-limit";

// Limit login attempts to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per `window`
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit public endpoints to prevent abuse (DDoS / bot spam)
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 public requests per `window`
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit specifically for AI generation to prevent cost blowouts
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 generations per hour
  message: { message: "Review generation quota exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});
