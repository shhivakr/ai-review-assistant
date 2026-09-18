import { BusinessModel } from "../models/Business.js";
import { QuestionModel } from "../models/Question.js";

/**
 * Type representing the sanitized public business configuration
 * intended for the customer-facing frontend.
 */
export interface PublicBusinessConfig {
  business: {
    name: string;
    logoUrl: string;
    description: string;
    address: string;
    phone: string;
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
 * 
 * Security Boundary: 
 * This service explicitly strips all MongoDB internal fields (_id, __v, qrToken, timestamps)
 * and only returns the active questions required to render the customer landing page.
 */
export async function getPublicBusinessConfig(
  qrToken: string
): Promise<PublicBusinessConfig | null> {
  const business = await BusinessModel.findOne({ qrToken }).exec();

  if (!business) {
    return null;
  }

  // Retrieve only ACTIVE questions, sorted deterministically by order
  const questions = await QuestionModel.find({ isActive: true })
    .sort({ order: 1 })
    .exec();

  return {
    business: {
      name: business.name,
      logoUrl: business.logoUrl,
      description: business.description,
      address: business.address,
      phone: business.phone,
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
