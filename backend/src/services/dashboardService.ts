import { FeedbackModel } from "../models/Feedback.js";

export async function getDashboardStats() {
  const totalFeedback = await FeedbackModel.countDocuments();

  const ratingAgg = await FeedbackModel.aggregate([
    { $group: { _id: null, averageRating: { $avg: "$rating" } } }
  ]);
  const averageRating = ratingAgg.length > 0 ? Number(ratingAgg[0].averageRating.toFixed(1)) : 0;

  const sentimentAgg = await FeedbackModel.aggregate([
    { $match: { "generatedReviews.sentiment": { $exists: true } } },
    { $group: { _id: "$generatedReviews.sentiment", count: { $sum: 1 } } }
  ]);
  
  const sentiments = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  sentimentAgg.forEach((s) => {
    if (s._id in sentiments) {
      sentiments[s._id as keyof typeof sentiments] = s.count;
    }
  });

  const redirectClicks = await FeedbackModel.countDocuments({ redirectClicked: true });

  const conversionRate = totalFeedback > 0 
    ? Number(((redirectClicks / totalFeedback) * 100).toFixed(1)) 
    : 0;

  return {
    totalFeedback,
    averageRating,
    sentiments,
    funnel: {
      redirectClicks,
      conversionRate
    }
  };
}

export async function getFeedbackList(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const items = await FeedbackModel.find()
    .select("-answers -generatedReviews.reviews -editedReviewText")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  const total = await FeedbackModel.countDocuments();

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getFeedbackDetail(id: string) {
  return FeedbackModel.findById(id).lean().exec();
}
