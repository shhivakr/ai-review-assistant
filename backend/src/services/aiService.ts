import { GoogleGenAI, Type } from "@google/genai";
import { FeedbackModel } from "../models/Feedback.js";
import { BusinessModel } from "../models/Business.js";

const ai = new GoogleGenAI({});

/**
 * Deterministic fallback reviews based on overall rating.
 */
function getFallbackReviews(rating: number) {
  if (rating >= 4) {
    return {
      sentiment: "POSITIVE",
      summary: "Customer had a highly positive experience.",
      reviews: [
        { style: "Natural", text: "I had a wonderful experience here! Everything was handled so well, and I left very happy. Highly recommend it to anyone." },
        { style: "Short", text: "Fantastic service and a great overall experience. I will definitely be coming back!" },
        { style: "Warm", text: "Thank you so much for the lovely experience. I felt truly valued as a customer and appreciate the care you took." },
        { style: "Professional", text: "The quality of service provided was excellent. The entire process was efficient, courteous, and highly professional." }
      ]
    };
  } else if (rating === 3) {
    return {
      sentiment: "NEUTRAL",
      summary: "Customer had an average experience.",
      reviews: [
        { style: "Natural", text: "My visit was okay overall. Nothing exceptionally good or bad to point out, just a standard experience." },
        { style: "Short", text: "Average experience. Everything was fine." },
        { style: "Warm", text: "I appreciate the service, though I feel there is some room for improvement. Still, a decent visit overall." },
        { style: "Professional", text: "The service met basic expectations, though it did not exceed them. An adequate overall experience." }
      ]
    };
  } else {
    return {
      sentiment: "NEGATIVE",
      summary: "Customer had a negative experience.",
      reviews: [
        { style: "Natural", text: "Honestly, I was pretty disappointed with my experience here. I expected much better service." },
        { style: "Short", text: "Disappointing experience. I would not recommend this place based on my visit." },
        { style: "Warm", text: "I was hoping for a better experience, but unfortunately, things didn't go as expected. I hope you can improve in the future." },
        { style: "Professional", text: "The level of service provided was subpar and did not meet acceptable standards." }
      ]
    };
  }
}

export async function generateReviewOptions(feedbackId: string): Promise<void> {
  const feedback = await FeedbackModel.findById(feedbackId).exec();
  if (!feedback) {
    throw new Error(`Feedback ${feedbackId} not found.`);
  }

  const business = await BusinessModel.findOne({ qrToken: feedback.qrToken }).exec();
  const businessName = business?.name ?? "this business";
  const businessDescription = business?.description?.trim() ?? "";

  const descriptionContext = businessDescription
    ? `Business description: ${businessDescription}`
    : "";

  let qaContext = "";
  feedback.answers.forEach((ans) => {
    qaContext += `Q: ${ans.questionText}\nA: ${ans.answer}\n`;
  });

  const prompt = `
You are drafting authentic Google review suggestions for a business on behalf of a customer.

BUSINESS CONTEXT
Name: ${businessName}
${descriptionContext}

CUSTOMER INPUT
Overall Rating: ${feedback.rating} / 5
${feedback.answers.length > 0 ? "Additional Feedback:\n" + qaContext : ""}

RATING-AWARE SENTIMENT CONTROL
- 1 star: Strongly negative but natural and restrained.
- 2 stars: Mostly negative with limited positivity.
- 3 stars: Balanced / mixed.
- 4 stars: Positive but not excessively enthusiastic. Do NOT sound like a 5-star review.
- 5 stars: Very positive and appreciative.

NO HALLUCINATION RULE
- Since you only have a star rating, DO NOT invent facts.
- DO NOT invent: jewelry purchased, designs, specific staff names, pricing, discounts, dates, waiting times, or personal stories.
- Only use the business name and the provided rating sentiment.

ANTI-REPETITION RULES
- Each draft MUST have a meaningfully different sentence structure and rhythm.
- Avoid repeating the same opening or closing.
- Do NOT repeatedly use phrases like "great experience", "highly recommended", "friendly staff", or "excellent service".
- Actively use alternative natural phrasing.

TASK
Generate exactly 4 distinct review drafts matching the exact styles below:

1. Style: "Natural"
Conversational and human. Sounds like a normal customer casually writing a review.

2. Style: "Short"
Very concise. Usually 1–2 sentences.

3. Style: "Warm"
Friendly and appreciative. Slightly more personal in tone.

4. Style: "Professional"
Clean, polished and restrained. Avoid exaggerated language.

Return the response in the required JSON format.
`.trim();

  let generatedResult: any = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 2;

  while (attempts < MAX_ATTEMPTS && !generatedResult) {
    attempts++;
    try {
      const generatePromise = ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.9,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
              summary: { type: Type.STRING },
              reviews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    style: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["style", "text"],
                },
              },
            },
            required: ["sentiment", "summary", "reviews"],
          },
          systemInstruction:
            "You write authentic, varied customer review drafts. Never invent facts. Follow instructions strictly.",
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI Generation Timeout")), 12000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      if (response?.text) {
        const parsed = JSON.parse(response.text);
        if (
          parsed.sentiment &&
          parsed.summary &&
          Array.isArray(parsed?.reviews) &&
          parsed.reviews.length >= 3
        ) {
          generatedResult = parsed;
        } else {
          console.warn(`AI attempt ${attempts}: unexpected schema`, parsed);
        }
      }
    } catch (err) {
      console.warn(`AI generation attempt ${attempts} failed:`, err);
    }
  }

  if (!generatedResult) {
    console.warn("Using deterministic fallback reviews.");
    generatedResult = getFallbackReviews(feedback.rating);
  }

  feedback.generatedReviews = generatedResult;
  await feedback.save();
}
