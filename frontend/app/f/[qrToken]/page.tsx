"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { fetchApi } from "@/lib/apiClient";
import { Star, Copy, ExternalLink, Check, Loader2, Gem, Users, Heart, Clock, Globe, ArrowLeft, Sparkle, CheckCircle2, Circle, Lightbulb, AlertCircle } from "lucide-react";

type Business = {
  name: string;
  logoUrl?: string;
  description?: string;
  googleReviewUrl?: string;
};

type ReviewSuggestion = { style: string; text: string };

export default function CustomerFlow({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = use(params);

  const [business, setBusiness] = useState<Business | null>(null);
  const [pageError, setPageError] = useState("");

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [phase, setPhase] = useState<"welcome" | "rate" | "loading" | "error" | "reviews" | "done">("welcome");
  const [loadingStep, setLoadingStep] = useState(0);

  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const starLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi(`/api/public/business/${qrToken}`);
        setBusiness(data.business);
      } catch (err: any) {
        setPageError(err.status === 404 ? "This QR code is no longer active." : "Something went wrong.");
      }
    }
    load();
  }, [qrToken]);

  const handleSubmitRating = async () => {
    if (rating === 0 || phase === "loading") return;
    setError("");
    setPhase("loading");
    setLoadingStep(0);

    try {
      let fId = feedbackId;
      if (!fId) {
        const submitRes = await fetchApi(`/api/public/feedback/${qrToken}`, {
          method: "POST",
          body: JSON.stringify({ rating, answers: [] }),
        });
        fId = submitRes.feedbackId;
        setFeedbackId(fId);
      }

      const genRes = await fetchApi(`/api/public/feedback/${fId}/generate`, { method: "POST" });
      const suggestions: ReviewSuggestion[] = genRes.generatedReviews?.reviews ?? [];
      setReviews(suggestions);
      if (suggestions.length > 0) {
        setSelectedIndex(0);
        setEditedText(suggestions[0].text);
      }
      setPhase("reviews");
    } catch {
      setPhase("error");
    }
  };

  useEffect(() => {
    if (phase === "loading") {
      const t1 = setTimeout(() => setLoadingStep(1), 1800);
      const t2 = setTimeout(() => setLoadingStep(2), 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [phase]);

  const [confirmedState, setConfirmedState] = useState(false);

  const handleSelect = (i: number) => {
    setSelectedIndex(i);
    setEditedText(reviews[i]?.text ?? "");
    setIsEditing(false);
    setCopied(false);
    setConfirmedState(false);
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(editedText); } catch {}
    setCopied(true);
    
    if (feedbackId && selectedIndex !== null) {
      fetchApi(`/api/public/feedback/${feedbackId}/select`, {
        method: "PATCH",
        body: JSON.stringify({ selectedIndex, editedReviewText: editedText }),
      }).catch(() => {});
    }

    setTimeout(() => {
      setCopied(false);
      setPhase("done");
    }, 1500);
  };

  const handleGoToGoogle = async () => {
    if (feedbackId) {
      fetchApi(`/api/public/feedback/${feedbackId}/redirect`, { method: "POST" }).catch(() => {});
    }
    if (business?.googleReviewUrl) {
      window.location.href = business.googleReviewUrl;
    }
  };

  /* ── Page-level error ── */
  if (pageError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-base font-medium text-neutral-800">{pageError}</p>
        </div>
      </div>
    );
  }

  /* ── Loading business ── */
  if (!business) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#1A1412]">
        <Loader2 className="h-5 w-5 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col ${phase === "welcome" ? "bg-[#0A0806]" : "bg-[#FCFAF5]"}`}>
      
      {/* ═══════════════ WELCOME (Luxury Exact Match) ═══════════════ */}
      {phase === "welcome" ? (
        <div className="flex-1 flex flex-col justify-between relative overflow-hidden bg-[#0A0806] w-full max-w-[430px] mx-auto">
          
          {/* Background Image & Overlays */}
          <div className="absolute inset-0 opacity-[0.60] mix-blend-screen overflow-hidden">
            <Image
              src="/hero-bg.jpg"
              alt="Luxury Background"
              fill
              priority
              quality={85}
              className="object-cover object-center"
            />
          </div>
          {/* Heavy gradient overlay to ensure text readability exactly like the mockup */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0806]/95 via-[#0A0806]/50 to-[#0A0806] pointer-events-none" />
          
          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full px-6 py-8">
            
            {/* Top Bar */}
            <div className="w-full flex justify-end">
              <button className="flex items-center gap-1.5 text-[12px] font-medium text-white/90 bg-[#1A1A1A]/60 hover:bg-[#1A1A1A]/80 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md transition-colors">
                <Globe className="h-3.5 w-3.5 text-[#DDB879]" strokeWidth={1.5} />
                English
                <span className="text-[9px] ml-1 opacity-70">▼</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col items-center text-center mt-12 mb-auto">
              
              {/* Branding */}
              <div className="mb-8 flex flex-col items-center">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="h-16 w-auto object-contain mb-3" />
                ) : (
                  <Gem className="h-12 w-12 text-[#DDB879] mb-3" strokeWidth={1} />
                )}
                <h1 className="text-[20px] tracking-[0.15em] font-serif text-white uppercase text-balance leading-none mt-1">
                  {business.name || "Tyagi Jewellers"}
                </h1>
                <p className="mt-2.5 text-[7px] tracking-[0.35em] font-medium text-white/70 uppercase">
                  Trusted Today. Treasured Forever.
                </p>
              </div>

              {/* Typography */}
              <h2 className="text-[42px] leading-[1.1] font-serif text-white mb-5 tracking-tight drop-shadow-md">
                Your<br/>Experience<br/>Matters
              </h2>
              <p className="text-white/80 text-[14px] leading-[1.5] max-w-[260px] font-light drop-shadow-sm">
                Help us grow and continue creating beautiful moments together.
              </p>
            </div>

            {/* Bottom Area (Features & CTA) */}
            <div className="w-full flex flex-col gap-8 mt-12 pb-2">
              
              {/* Features Row */}
              <div className="flex justify-between px-1">
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <Gem className="h-[22px] w-[22px] text-[#DDB879]" strokeWidth={1.25} />
                  <span className="text-[11px] text-white/90 text-center leading-[1.2] font-medium tracking-wide">
                    Premium<br/>Collections
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <Users className="h-[22px] w-[22px] text-[#DDB879]" strokeWidth={1.25} />
                  <span className="text-[11px] text-white/90 text-center leading-[1.2] font-medium tracking-wide">
                    Trusted<br/>Service
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <Heart className="h-[22px] w-[22px] text-[#DDB879]" strokeWidth={1.25} />
                  <span className="text-[11px] text-white/90 text-center leading-[1.2] font-medium tracking-wide">
                    Lifelong<br/>Relationships
                  </span>
                </div>
              </div>

              {/* CTA Group */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setPhase("rate")}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D8B46B] via-[#E9CC8A] to-[#D8B46B] hover:opacity-90 text-[#1A1105] px-8 h-[54px] text-[15px] font-semibold transition-all active:scale-[0.98] shadow-lg"
                >
                  Share Your Experience
                  <span className="text-lg leading-none ml-1 opacity-80">→</span>
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-white/60">
                  <Clock className="h-3.5 w-3.5 text-[#DDB879]" strokeWidth={1.5} />
                  <span>Takes less than a minute</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-[420px] mx-auto px-6">

          {/* ═══════════════ RATE ═══════════════ */}
          {phase === "rate" && (
            <div className="flex-1 flex flex-col pt-4 pb-8 relative w-full mx-auto animate-slide-up">
              
              {/* Subtle Bottom Floral Decor (mimicking image background) */}
              <div className="absolute bottom-20 left-0 right-0 pointer-events-none opacity-[0.15] flex justify-center overflow-hidden">
                <svg width="300" height="120" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M150 120 C 150 60, 90 30, 20 10 M150 120 C 150 60, 210 30, 280 10 M150 120 C 150 70, 120 45, 90 30 M150 120 C 150 70, 180 45, 210 30 M150 120 V 20 M120 70 C 135 60, 150 60, 150 60 M180 70 C 165 60, 150 60, 150 60" stroke="#9A7B4F" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Top Header */}
              <div className="flex items-center justify-center relative w-full mb-12 pt-2">
                <button 
                  onClick={() => setPhase("welcome")} 
                  className="absolute left-0 p-2 -ml-2 text-[#5A524D] hover:text-[#1A1412] transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                
                {/* Step Indicator */}
                <div className="flex flex-col items-center gap-2.5">
                  <span className="text-[11.5px] font-medium text-[#5A524D] tracking-wide">
                    Step 1 of 3
                  </span>
                  <div className="flex gap-1.5">
                    <div className="h-[3px] w-9 bg-[#D8B46B] rounded-full"></div>
                    <div className="h-[3px] w-9 bg-[#E8DCC8] rounded-full"></div>
                    <div className="h-[3px] w-9 bg-[#E8DCC8] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center flex-1 z-10 px-2">
                <h2 className="text-[28px] sm:text-[32px] leading-[1.15] font-serif text-[#1A1412] mb-3 text-center tracking-tight text-balance">
                  How would you rate your overall experience with {business.name || "Tyagi Jewellers"}?
                </h2>
                <p className="text-[14.5px] text-[#4A5568] text-center mb-10 font-medium">
                  Tap a star to tell us how we did.
                </p>

                {/* Stars */}
                <div className="flex gap-2 mb-5" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoveredStar || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star === rating}
                        aria-label={`${star} star`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg transition-transform active:scale-90 hover:scale-110 p-1"
                      >
                        <Star
                          className={`h-[46px] w-[46px] transition-all duration-200 ${
                            active
                              ? "fill-[#F5A623] text-[#F5A623]"
                              : "fill-transparent text-[#CBA878] stroke-[1.5]"
                          } ${star === rating ? "star-pop" : ""}`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Rating Display */}
                <div className="h-20 flex flex-col items-center justify-start mt-2">
                  {rating > 0 ? (
                    <>
                      <p className="text-[14px] font-medium text-[#4A5568] mb-3 animate-slide-up">
                        {rating} out of 5
                      </p>
                      <span className="inline-flex items-center px-6 py-2 rounded-full bg-[#ECFDF5] text-[13.5px] font-semibold text-[#065F46] animate-slide-up shadow-sm">
                        {starLabels[rating]}!
                      </span>
                    </>
                  ) : null}
                </div>
                
                {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
              </div>

              {/* Bottom CTA */}
              <div className="mt-auto z-10 w-full pt-6">
                <button
                  onClick={handleSubmitRating}
                  disabled={rating === 0}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl h-[56px] text-[15px] font-medium transition-all active:scale-[0.98]
                    ${rating === 0 
                      ? "bg-[#D8C9B1] text-[#9A8A70] cursor-not-allowed opacity-70" 
                      : "bg-[#96702E] hover:bg-[#856125] text-white shadow-md"
                    }
                  `}
                >
                  Next
                  <span className="text-lg leading-none font-normal ml-0.5">→</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════ LOADING ═══════════════ */}
          {phase === "loading" && (
            <div className="flex-1 flex flex-col w-full mx-auto animate-slide-up pb-8 pt-4">
              {/* Step Indicator */}
              <div className="flex flex-col items-center gap-2.5 mb-14 pt-2">
                <span className="text-[11.5px] font-medium text-[#5A524D] tracking-wide">
                  Step 2 of 3
                </span>
                <div className="flex gap-1.5">
                  <div className="h-[3px] w-9 bg-[#D8B46B] rounded-full"></div>
                  <div className="h-[3px] w-9 bg-[#D8B46B] rounded-full"></div>
                  <div className="h-[3px] w-9 bg-[#E8DCC8] rounded-full"></div>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                {/* Visual Loader */}
                <div className="relative w-[110px] h-[110px] flex items-center justify-center mb-8">
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-r-[#D8B46B] border-t-[#D8B46B] border-l-[#D8B46B]/20 border-b-[#D8B46B]/20 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D8B46B]/5 to-transparent" />
                  <Sparkle className="w-11 h-11 text-[#A37B31] animate-pulse" strokeWidth={1} fill="#A37B31" />
                </div>

                <h2 className="text-[28px] font-serif font-bold text-[#1A1412] mb-3 text-center tracking-tight leading-[1.15]">Creating your<br/>review...</h2>
                <p className="text-[14.5px] text-[#4A5568] text-center max-w-[280px] leading-relaxed mb-10 font-medium">
                  We're turning your feedback into a few review options. This will just take a moment.
                </p>

                {/* Progress Checklist */}
                <div className="w-full max-w-[250px] flex flex-col gap-4 mb-auto">
                  {[
                    "Analyzing your rating",
                    "Generating review drafts",
                    "Almost ready..."
                  ].map((text, idx) => {
                    const isCompleted = loadingStep > idx;
                    const isCurrent = loadingStep === idx;
                    const isPending = loadingStep < idx;

                    return (
                      <div key={idx} className={`flex items-center gap-4 transition-opacity duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-[#96702E] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                          ) : isCurrent ? (
                            <>
                              <Circle className="absolute inset-0 w-5 h-5 text-[#96702E]/20" strokeWidth={2} />
                              <Loader2 className="absolute inset-0 w-5 h-5 text-[#96702E] animate-spin" strokeWidth={2.5} />
                            </>
                          ) : (
                            <Circle className="w-5 h-5 text-[#9A8A70]/40" strokeWidth={2} />
                          )}
                        </div>
                        <span className={`text-[14.5px] ${isCurrent || isCompleted ? 'text-[#332D29] font-medium' : 'text-[#716861]'}`}>
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Lightbulb Tip */}
                <div className="mt-12 w-full bg-[#F3EFE6] rounded-2xl p-4 flex items-start gap-3 border border-[#E5DBC7]/50 shadow-sm">
                  <Lightbulb className="w-5 h-5 text-[#96702E] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13.5px] text-[#5A524D] leading-snug">
                    <strong className="text-[#1A1412] font-semibold">Your feedback</strong> helps us serve you better!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ ERROR ═══════════════ */}
          {phase === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-slide-up w-full">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-[24px] font-serif font-bold text-[#1A1412] mb-3">Something went wrong</h2>
              <p className="text-[14.5px] text-[#5A524D] text-center mb-10 max-w-[280px]">
                We couldn't create your review right now. Please try again.
              </p>
              <button
                onClick={handleSubmitRating}
                className="w-full max-w-[280px] flex items-center justify-center rounded-2xl bg-[#96702E] hover:bg-[#856125] text-white px-8 h-[54px] text-[15px] font-medium transition-all active:scale-[0.98] shadow-md"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ═══════════════ REVIEWS ═══════════════ */}
          {phase === "reviews" && (
            <div className="flex-1 flex flex-col pt-8 pb-12 animate-slide-up w-full px-2">
              <h2 className="text-[26px] sm:text-[28px] font-bold font-serif text-[#1A1412] text-center mb-2 tracking-tight">Your review is ready! ✨</h2>
              <p className="text-[14.5px] text-[#5A524D] text-center mb-8 font-medium">
                Choose a version you like, or edit it.
              </p>

              {/* Style Tabs */}
              <div className="flex p-1.5 bg-[#E8DCC8]/40 rounded-full mb-8 max-w-sm mx-auto w-full">
                {reviews.map((review, i) => {
                  const styleName = review.style || ["Natural", "Short", "Detailed"][i] || `Option ${i+1}`;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className={`flex-1 text-[13.5px] font-semibold py-2.5 rounded-full transition-all duration-200 ${
                        selectedIndex === i 
                          ? "bg-[#1A1412] text-[#D8B46B] shadow-md" 
                          : "text-[#5A524D] hover:text-[#1A1412]"
                      }`}
                    >
                      {styleName}
                    </button>
                  );
                })}
              </div>

              {selectedIndex !== null && (
                <div className="w-full">
                  {isEditing ? (
                    <div className="w-full bg-white rounded-3xl border border-[#E8DCC8] p-5 shadow-sm mb-6 animate-in fade-in zoom-in-95 duration-200">
                      <h3 className="text-[15px] font-bold font-serif text-[#1A1412] mb-4">Edit your review</h3>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={6}
                        autoFocus
                        className="w-full rounded-2xl border border-[#E8DCC8] bg-[#FCFAF5] px-4 py-3.5 text-[15px] leading-relaxed text-[#332D29] resize-none focus:outline-none focus:ring-2 focus:ring-[#D8B46B]/50 transition-all"
                      />
                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => { setEditedText(reviews[selectedIndex].text); setIsEditing(false); }}
                          className="flex-1 h-12 rounded-2xl border border-[#E8DCC8] text-[14px] font-bold text-[#5A524D] hover:bg-[#FCFAF5] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const newReviews = [...reviews];
                            newReviews[selectedIndex].text = editedText;
                            setReviews(newReviews);
                            setIsEditing(false);
                          }}
                          className="flex-[1.5] h-12 rounded-2xl bg-[#1A1412] text-[14px] font-bold text-white hover:bg-[#332D29] transition-colors"
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  ) : confirmedState ? (
                    <div className="w-full animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                      {/* Selected Review Display */}
                      <div className="w-full bg-white rounded-3xl border border-[#D8B46B]/40 p-6 shadow-sm mb-8 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ECFDF5] border border-[#065F46]/10 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
                          <span className="text-[11px] font-bold text-[#065F46] uppercase tracking-wider">Selected</span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-[#332D29] text-center italic mt-3">
                          "{reviews[selectedIndex].text}"
                        </p>
                      </div>

                      <button
                        onClick={handleCopy}
                        className={`w-full flex items-center justify-center gap-2 rounded-2xl h-[56px] text-[16px] font-semibold transition-all active:scale-[0.98] ${
                          copied
                            ? "bg-[#ECFDF5] text-[#065F46] border border-[#065F46]/20 shadow-sm"
                            : "bg-[#96702E] hover:bg-[#856125] text-white shadow-md"
                        }`}
                      >
                        {copied ? (
                          <><CheckCircle2 className="h-5 w-5" /> Review copied</>
                        ) : (
                          <><Copy className="h-5 w-5" /> Copy Review</>
                        )}
                      </button>

                    </div>
                  ) : (
                    <div className="w-full bg-white rounded-3xl border border-[#E8DCC8] p-6 shadow-sm mb-6 animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-[15px] leading-relaxed text-[#332D29] mb-8">
                        "{reviews[selectedIndex].text}"
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex-1 h-12 rounded-2xl border border-[#E8DCC8] text-[14px] font-bold text-[#5A524D] hover:bg-[#FCFAF5] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmedState(true)}
                          className="flex-[1.5] h-12 rounded-2xl bg-[#96702E] hover:bg-[#856125] text-[14px] font-bold text-white shadow-sm transition-colors"
                        >
                          Use this review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ DONE ═══════════════ */}
          {phase === "done" && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-2 animate-slide-up w-full">
              <div className="mb-8 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#FCFAF5] border-[3px] border-[#D8B46B]/40 shadow-sm">
                <Check className="h-10 w-10 text-[#96702E] animate-in zoom-in duration-500" strokeWidth={3} />
              </div>
              
              <h2 className="text-[28px] sm:text-[32px] font-serif font-bold text-[#1A1412] mb-3 text-center tracking-tight leading-tight">
                You're ready<br/>to share! 🎉
              </h2>
              
              <p className="text-[14.5px] text-[#5A524D] text-center max-w-[280px] leading-relaxed font-medium mb-10">
                Your review has been copied. Now continue to Google to post your review.
              </p>
              
              <div className="w-full max-w-sm space-y-4">
                <div className="rounded-2xl bg-white border border-[#E8DCC8] p-5 flex gap-4 items-start shadow-sm">
                   <div className="bg-[#FCFAF5] p-2.5 rounded-xl border border-[#E8DCC8] shrink-0 shadow-sm mt-0.5">
                      <Copy className="h-5 w-5 text-[#D8B46B]" />
                   </div>
                   <div>
                      <p className="text-[14px] font-bold text-[#1A1412] mb-1">Review copied</p>
                      <p className="text-[13px] text-[#5A524D] leading-snug">You can now paste it on Google.</p>
                   </div>
                </div>

                <div className="flex flex-col gap-3 pt-3">
                  {business.googleReviewUrl && (
                    <button
                      onClick={handleGoToGoogle}
                      className="w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl bg-[#96702E] hover:bg-[#856125] text-[15px] font-bold text-white transition-all active:scale-[0.98] shadow-md"
                    >
                      <img src="https://www.gstatic.com/images/branding/product/1x/gmb_48dp.png" className="w-[18px] h-[18px] grayscale brightness-200" alt="Google" />
                      Continue to Google →
                    </button>
                  )}
                  
                  <button
                    onClick={async () => {
                      try { await navigator.clipboard.writeText(editedText); } catch {}
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl border-2 border-[#E8DCC8] text-[#1A1412] text-[15px] font-bold hover:bg-white transition-all active:scale-[0.98]"
                  >
                    {copied ? <><CheckCircle2 className="h-4 w-4 text-[#065F46]" /> <span className="text-[#065F46]">Copied!</span></> : <><Copy className="h-4 w-4" /> Copy again</>}
                  </button>
                </div>
              </div>

              <div className="mt-14 text-center">
                <p className="text-[13.5px] text-[#5A524D] font-serif italic text-balance">
                  Thank you for being a part of {business.name || "Tyagi Jewellers"} ❤️
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
