"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/apiClient";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy, RefreshCw, Check, Printer } from "lucide-react";

export default function QRManagementPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchApi("/api/admin/business");
        if (data.business) setBusiness(data.business);
      } catch {
        // Handle
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleRegenerate = async () => {
    if (!confirm("This will permanently invalidate all existing QR codes and printed materials. Continue?")) return;
    setIsRegenerating(true);
    try {
      const data = await fetchApi("/api/admin/business/qr/regenerate", { method: "POST" });
      setBusiness((prev) => (prev ? { ...prev, qrToken: data.qrToken } : null));
    } catch {
      alert("Failed to regenerate token.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const link = document.createElement("a");
        link.download = "ReviewFlow_QR.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && qrRef.current) {
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      printWindow.document.write(`
        <html><head><title>ReviewFlow QR</title>
        <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0;}
        h2{font-size:20px;margin-bottom:8px;} p{color:#666;font-size:14px;margin:0 0 24px;}</style></head>
        <body><h2>${business?.name || "ReviewFlow"}</h2><p>Scan to leave a review</p>${svgData}
        <script>setTimeout(()=>window.print(),300)</script></body></html>
      `);
      printWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-80 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const publicUrl = business?.qrToken
    ? typeof window !== "undefined"
      ? `${window.location.origin}/f/${business.qrToken}`
      : `/f/${business.qrToken}`
    : "";

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download and share your customer review QR code.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* QR Preview */}
        <div className="md:col-span-3 flex flex-col items-center rounded-2xl border border-border/50 bg-card p-8">
          {publicUrl ? (
            <>
              <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-border/30">
                <QRCodeSVG
                  value={publicUrl}
                  size={220}
                  level="H"
                  includeMargin
                  ref={qrRef}
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Scan to leave a review for <span className="font-medium text-foreground">{business?.name}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-12">QR code not available.</p>
          )}
        </div>

        {/* Actions */}
        <div className="md:col-span-2 space-y-4">
          {/* URL */}
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <label className="text-xs font-medium text-muted-foreground block mb-2">Customer URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={publicUrl}
                className="flex-1 min-w-0 rounded-lg border border-input bg-muted/40 px-3 py-2 text-xs font-mono text-foreground truncate"
              />
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  copied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-border hover:bg-accent"
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Download & Print */}
          <div className="space-y-2">
            <Button onClick={downloadQR} variant="outline" className="w-full justify-start h-10 text-sm">
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button onClick={handlePrint} variant="outline" className="w-full justify-start h-10 text-sm">
              <Printer className="h-4 w-4 mr-2" />
              Print QR code
            </Button>
          </div>

          {/* Regenerate */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800 mb-1">Regenerate token</p>
            <p className="text-[11px] text-amber-700/80 leading-relaxed mb-3">
              All existing QR codes will stop working immediately.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="h-8 text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Regenerating…" : "Regenerate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
