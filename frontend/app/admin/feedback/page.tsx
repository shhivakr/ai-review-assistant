"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { PaginatedFeedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function FeedbackListPage() {
  const [data, setData] = useState<PaginatedFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetchApi(`/api/admin/dashboard/feedback?page=${page}`);
        setData(res);
      } catch (err) {
        console.error("Failed to load feedback", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All customer submissions and AI-generated reviews.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No feedback received yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Customer submissions will appear here after they scan your QR code.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/50 overflow-hidden">
            {data.items.map((fb) => (
              <Link
                key={fb._id}
                href={`/admin/feedback/${fb._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors group"
              >
                {/* Rating */}
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{fb.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {fb.generatedReviews?.sentiment && (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                          fb.generatedReviews.sentiment === "POSITIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : fb.generatedReviews.sentiment === "NEGATIVE"
                            ? "bg-red-50 text-red-500"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {fb.generatedReviews.sentiment.toLowerCase()}
                      </span>
                    )}
                    {fb.redirectClicked && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                        <ExternalLink className="h-2.5 w-2.5" />
                        Google
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate max-w-md">
                    {fb.generatedReviews?.summary || `${fb.answers?.length || 0} answer(s) submitted`}
                  </p>
                </div>

                {/* Date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                    {new Date(fb.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
