"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { Question, QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Type, ListChecks, GripVertical, X } from "lucide-react";

const TYPE_ICONS: Record<QuestionType, React.ElementType> = {
  RATING: Star,
  TEXT: Type,
  MULTIPLE_CHOICE: ListChecks,
};

const TYPE_LABELS: Record<QuestionType, string> = {
  RATING: "Star Rating",
  TEXT: "Free Text",
  MULTIPLE_CHOICE: "Multiple Choice",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<QuestionType>("TEXT");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [createError, setCreateError] = useState("");

  async function load() {
    try {
      const data = await fetchApi("/api/admin/questions");
      setQuestions(data.questions);
    } catch {
      // Handle
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleToggleActive = async (q: Question) => {
    if (q.isFixed) return;
    try {
      await fetchApi(`/api/admin/questions/${q._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...q, isActive: !q.isActive }),
      });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to update question.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetchApi(`/api/admin/questions/${id}`, { method: "DELETE" });
      load();
    } catch (err: any) {
      alert(err.message || "Failed to delete question.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!newText.trim()) return setCreateError("Question text is required.");

    let options: string[] | undefined;
    if (newType === "MULTIPLE_CHOICE") {
      options = newOptions.filter((o) => o.trim() !== "");
      if (options.length < 2) return setCreateError("At least 2 options are required.");
    }

    try {
      await fetchApi("/api/admin/questions", {
        method: "POST",
        body: JSON.stringify({ text: newText.trim(), type: newType, options, isActive: false }),
      });
      setNewText("");
      setNewType("TEXT");
      setNewOptions(["", ""]);
      setIsCreating(false);
      load();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create question.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const activeCustom = questions.filter((q) => q.isActive && !q.isFixed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure what customers answer after rating their experience.
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm" className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-1.5" />
            Add question
          </Button>
        )}
      </div>

      {/* Active indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-muted-foreground">Active custom questions:</span>
        <span className={`font-bold ${activeCustom >= 3 && activeCustom <= 4 ? "text-emerald-600" : "text-amber-600"}`}>
          {activeCustom} / 4
        </span>
      </div>

      {/* Create form */}
      {isCreating && (
        <div className="rounded-2xl border border-primary/20 bg-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">New Question</h3>
            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Question text</label>
              <Input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g. What did you like most?"
                className="h-10"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
              <div className="flex gap-2">
                {(["TEXT", "RATING", "MULTIPLE_CHOICE"] as QuestionType[]).map((t) => {
                  const Icon = TYPE_ICONS[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        newType === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {TYPE_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </div>

            {newType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2 rounded-xl bg-muted/40 p-4">
                <label className="text-xs font-medium text-muted-foreground block">Options</label>
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newOptions];
                        updated[idx] = e.target.value;
                        setNewOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="h-9 text-sm"
                    />
                    {newOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setNewOptions(newOptions.filter((_, i) => i !== idx))}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewOptions([...newOptions, ""])}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1"
                >
                  <Plus className="h-3 w-3" />
                  Add option
                </button>
              </div>
            )}

            {createError && <p className="text-xs text-destructive">{createError}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" size="sm">Save question</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Question list */}
      <div className="space-y-2">
        {questions.map((q) => {
          const Icon = TYPE_ICONS[q.type];
          return (
            <div
              key={q._id}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                q.isFixed
                  ? "border-primary/15 bg-primary/3"
                  : "border-border/50 bg-card hover:border-border"
              }`}
            >
              {/* Icon */}
              <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                q.isFixed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground">{q.text}</p>
                  {q.isFixed && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Fixed
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{TYPE_LABELS[q.type]}</span>
                  {q.options && q.options.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{q.options.length} options</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(q)}
                  disabled={q.isFixed}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    q.isFixed
                      ? "bg-emerald-50 text-emerald-600 cursor-default"
                      : q.isActive
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {q.isActive ? "Active" : "Inactive"}
                </button>
                {!q.isFixed && (
                  <button
                    onClick={() => handleDelete(q._id!)}
                    className="p-1.5 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
