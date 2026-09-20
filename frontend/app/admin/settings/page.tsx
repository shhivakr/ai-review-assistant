"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { Business } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Building2, Globe } from "lucide-react";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Partial<Business>>({
    name: "", logoUrl: "", description: "", address: "", phone: "", googleReviewUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/api/admin/business");
        if (data.business) setBusiness(data.business);
      } catch (err: any) {
        if (err.status !== 404) {
          setMessage({ text: "Failed to load settings.", type: "error" });
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBusiness((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const data = await fetchApi("/api/admin/business", {
        method: "PUT",
        body: JSON.stringify(business),
      });
      setBusiness(data.business);
      setMessage({ text: "Settings saved successfully.", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your business profile and Google review configuration.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message.text && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {message.type === "success" && <Check className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {/* Business Profile */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/40 px-6 py-4">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Business Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <SettingsField label="Business Name" required>
              <Input
                name="name"
                value={business.name || ""}
                onChange={handleChange}
                required
                className="h-10"
              />
            </SettingsField>
            <SettingsField label="Logo URL" hint="Direct link to your business logo image">
              <Input
                name="logoUrl"
                value={business.logoUrl || ""}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="h-10"
              />
            </SettingsField>
            <SettingsField label="Description">
              <textarea
                name="description"
                value={business.description || ""}
                onChange={handleChange}
                rows={3}
                placeholder="A short description of your business"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-colors"
              />
            </SettingsField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsField label="Address">
                <Input
                  name="address"
                  value={business.address || ""}
                  onChange={handleChange}
                  className="h-10"
                />
              </SettingsField>
              <SettingsField label="Phone">
                <Input
                  name="phone"
                  value={business.phone || ""}
                  onChange={handleChange}
                  className="h-10"
                />
              </SettingsField>
            </div>
          </div>
        </div>

        {/* Google Review */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/40 px-6 py-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Google Review</h2>
          </div>
          <div className="p-6">
            <SettingsField label="Google Review URL" hint="The direct link customers use to leave a Google review">
              <Input
                name="googleReviewUrl"
                value={business.googleReviewUrl || ""}
                onChange={handleChange}
                placeholder="https://g.page/r/..."
                className="h-10"
              />
            </SettingsField>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} className="min-w-[120px]">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SettingsField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
