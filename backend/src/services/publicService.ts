import { BusinessModel } from "../models/Business.js";
import { QuestionModel } from "../models/Question.js";

export interface PublicBusinessConfig {
  business: {
    name: string;
    logoUrl: string;
    description: string;
    address: string;
    phone: string;
    googleReviewUrl: string;
  };
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options: string[];
    order: number;
    isFixed: boolean;
  }>;
}

/**
 * Retrieves the business configuration and active questions using a public QR token.
 */
export async function getPublicBusinessConfig(
  qrToken: string
): Promise<PublicBusinessConfig | null> {
  const business = await BusinessModel.findOne({ qrToken }).lean().exec();
  if (!business) return null;

  // Retrieve only ACTIVE questions, sorted by order
  const questions = await QuestionModel.find({ isActive: true })
    .sort({ order: 1 })
    .lean()
    .exec();

  return {
    business: {
      name: business.name,
      logoUrl: business.logoUrl ?? "",
      description: business.description ?? "",
      address: business.address ?? "",
      phone: business.phone ?? "",
      googleReviewUrl: business.googleReviewUrl ?? "",
    },
    questions: questions.map((q) => ({
      id: q._id.toString(),
      text: q.text,
      type: q.type,
      options: q.options || [],
      order: q.order,
      isFixed: q.isFixed,
    })),
  };
}
