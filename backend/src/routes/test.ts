import { Router } from "express";
import { BusinessModel } from "../models/Business.js";

const router = Router();

router.post("/business", async (_req, res, next) => {
  try {
    const business = await BusinessModel.create({
      name: "Demo Business",
      description: "Demo business for development",
      qrToken: "demo-qr-token",
    });

    res.status(201).json(business);
  } catch (error) {
    next(error);
  }
});

router.get("/business", async (_req, res, next) => {
  try {
    const business = await BusinessModel.findOne({
      qrToken: "demo-qr-token",
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
});

export default router;
