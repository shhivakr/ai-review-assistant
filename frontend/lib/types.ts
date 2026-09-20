// ─── Admin types ────────────────────────────────────────────────────────────

export type Business = {
  _id?: string;
  name: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  phone?: string;
  googleReviewUrl?: string;
  qrToken?: string;
};

// ─── Question Configuration ─────────────────────────────────────

export type QuestionType = "RATING" | "TEXT" | "MULTIPLE_CHOICE";

export type Question = {
  _id?: string;
  id?: string;
  text: string;
  type: QuestionType;
  options?: string[];
  isActive: boolean;
  order: number;
  isFixed: boolean;
};

// ─── Feedback ────────────────────────────────────────

export type FeedbackAnswer = {
  questionId: string;
  questionText: string;
  type: QuestionType;
  answer: string | number;
};

export type ReviewSuggestion = {
  style: string;
  text: string;
};

export type GeneratedReviews = {
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  summary: string;
  reviews: ReviewSuggestion[];
};

export type Feedback = {
  _id: string;
  qrToken: string;
  rating: number;
  answers: FeedbackAnswer[];
  generatedReviews?: GeneratedReviews;
  selectedIndex?: number | null;
  editedReviewText?: string | null;
  redirectClicked: boolean;
  createdAt: string;
  updatedAt: string;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardStats = {
  totalFeedback: number;
  averageRating: number;
  sentiments: Record<string, number>;
  funnel: {
    redirectClicks: number;
    conversionRate: number;
  };
};

export type PaginatedFeedback = {
  items: Feedback[];
  total: number;
  page: number;
  totalPages: number;
};
