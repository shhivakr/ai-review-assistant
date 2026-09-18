import type { Request, Response } from "express";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../services/businessService.js";

/**
 * Returns the current business configuration.
 *
 * This endpoint is protected because business settings are administrative
 * data and must not be modified by public users.
 */
export async function getBusinessController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const business = await getBusinessSettings();

    if (!business) {
      res.status(404).json({
        message: "Business configuration not found",
      });

      return;
    }

    res.status(200).json({
      business,
    });
  } catch (error) {
    /**
     * Keep implementation details out of the API response while preserving
     * the actual error in server logs for debugging.
     */
    console.error("Failed to fetch business settings:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}

/**
 * Creates or updates the single business configuration.
 *
 * The request body has already been validated by the Zod middleware before
 * this controller executes.
 */
export async function updateBusinessController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const business = await updateBusinessSettings(req.body);

    res.status(200).json({
      business,
    });
  } catch (error) {
    console.error("Failed to update business settings:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
