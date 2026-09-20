import type { Request, Response } from "express";
import { getPublicBusinessConfig } from "../services/publicService.js";

/**
 * Handles the unauthenticated public lookup for a business via its QR token.
 * 
 * This endpoint requires no authentication since it is consumed by the 
 * customer-facing landing page. Route parameter validation prevents malformed lookups.
 */
export async function getPublicBusinessController(
  req: Request,
  res: Response
): Promise<void> {
  const { qrToken } = req.params;

  // Basic route parameter validation to avoid unnecessary DB queries
  if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
    res.status(400).json({
      message: "Invalid token",
    });
    return;
  }

  try {
    const config = await getPublicBusinessConfig(qrToken.trim());

    if (!config) {
      // Intentionally generic 404 to obscure database details
      res.status(404).json({
        message: "Business not found",
      });
      return;
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("Failed to retrieve public business config:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
