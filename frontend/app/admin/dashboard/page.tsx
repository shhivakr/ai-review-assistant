"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { DashboardStats, PaginatedFeedback } from "@/lib/types";
import { Star, MessageSquare, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<PaginatedFeedback | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsData, feedbackData] = await Promise.all([
          fetchApi("/api/admin/dashboard/stats"),
          fetchApi("/api/admin/dashboard/feedback?page=1&limit=5"),
        ]);
        setStats(statsData);
        setRecentFeedback(feedbackData);
      } catch (err: any) {
        setError("Failed to load dashboard.");
      }
    }
    load();
  }, []);

  if (error) return <div className="py-12 text-center text-sm text-destructive">{error}</div>;

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your customer feedback and reviews.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Feedback"
          value={stats.totalFeedback}
          icon={MessageSquare}
        />
        <StatCard
          label="Average Rating"
          value={stats.averageRating > 0 ? `${stats.averageRating}` : "—"}
          sub={stats.averageRating > 0 ? "out of 5" : "No ratings yet"}
          icon={Star}
        />
        <StatCard
          label="Positive Sentiment"
          value={stats.sentiments?.POSITIVE || 0}
          sub={stats.totalFeedback > 0 ? `of ${stats.totalFeedback} total` : undefined}
          icon={TrendingUp}
        />
        <StatCard
          label="Google Redirects"
          value={stats.funnel.redirectClicks}
          sub={stats.funnel.conversionRate > 0 ? `${stats.funnel.conversionRate}% conversion` : undefined}
          icon={MousePointerClick}
        />
      </div>

      {/* Recent Feedback */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Recent Feedback</h2>
          <Link
            href="/admin/feedback"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!recentFeedback || recentFeedback.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No feedback yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Customer submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card divide-y divide-border/50 overflow-hidden">
            {recentFeedback.items.map((fb) => (
              <Link
                key={fb._id}
                href={`/admin/feedback/${fb._id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors"
              >
                {/* Rating badge */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold text-sm">
                  {fb.rating}★
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
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
                      <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                        Google
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {fb.generatedReviews?.summary || `${fb.answers?.length || 0} answer(s) submitted`}
                  </p>
                </div>

                {/* Date */}
                <span className="flex-shrink-0 text-xs text-muted-foreground/70">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
