"use client";

import { useEffect, useState, use } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { Feedback } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Star, Check, AlertTriangle } from "lucide-react";

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi(`/api/admin/dashboard/feedback/${id}`);
        setFeedback(data);
      } catch (err: any) {
        setError(err.message || "Failed to load feedback details");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        <div className="h-60 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }
  if (error) return <div className="py-12 text-center text-sm text-destructive">{error}</div>;
  if (!feedback) return <div className="py-12 text-center text-sm text-muted-foreground">Not found.</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/admin/feedback"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All feedback
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i < feedback.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-slate-200"
                }`}
                strokeWidth={1.5}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {feedback.generatedReviews?.sentiment && (
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
                  feedback.generatedReviews.sentiment === "POSITIVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : feedback.generatedReviews.sentiment === "NEGATIVE"
                    ? "bg-red-50 text-red-500"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {feedback.generatedReviews.sentiment.toLowerCase()}
              </span>
            )}
            {feedback.redirectClicked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-500">
                <ExternalLink className="h-3 w-3" />
                Google redirect
              </span>
            )}
          </div>

          <span className="sm:ml-auto text-xs text-muted-foreground">
            {new Date(feedback.createdAt).toLocaleDateString()} at{" "}
            {new Date(feedback.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* AI Summary */}
        {feedback.generatedReviews?.summary && (
          <p className="mt-4 text-sm text-muted-foreground border-t border-border/40 pt-4">
            <span className="font-medium text-foreground">AI Summary: </span>
            {feedback.generatedReviews.summary}
          </p>
        )}
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Customer Answers</h2>
        {feedback.answers && feedback.answers.length > 0 ? (
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/40 overflow-hidden">
            {feedback.answers.map((ans, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">{ans.questionText}</p>
                <p className="text-sm text-foreground">
                  {ans.type === "RATING" ? (
                    <span className="inline-flex items-center gap-1">
                      {ans.answer}
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                  ) : (
                    String(ans.answer)
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No additional answers provided.</p>
        )}
      </div>

      {/* Generated Reviews */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Generated Reviews</h2>
        {!feedback.generatedReviews?.reviews || feedback.generatedReviews.reviews.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            No reviews were generated for this submission.
          </div>
        ) : (
          <div className="space-y-2">
            {feedback.generatedReviews.reviews.map((review, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  feedback.selectedIndex === i
                    ? "border-primary/40 bg-primary/4"
                    : "border-border/40 bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {review.style}
                  </span>
                  {feedback.selectedIndex === i && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      <Check className="h-3 w-3" />
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edited/Copied text */}
      {feedback.editedReviewText && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Final Copied Text</h2>
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {feedback.editedReviewText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
