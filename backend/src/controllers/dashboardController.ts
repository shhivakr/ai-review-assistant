import type { Request, Response } from "express";
import { getDashboardStats, getFeedbackList, getFeedbackDetail } from "../services/dashboardService.js";

export async function getStatsController(_req: Request, res: Response): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFeedbackListController(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await getFeedbackList(page, limit);
    res.status(200).json(data);
  } catch (error) {
    console.error("Failed to fetch feedback list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFeedbackDetailController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Invalid ID" });
    return;
  }

  try {
    const detail = await getFeedbackDetail(id);
    if (!detail) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }
    res.status(200).json(detail);
  } catch (error) {
    console.error("Failed to fetch feedback detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
