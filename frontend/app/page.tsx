"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

type HealthResponse = {
  status: string;
  service: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg border p-6">
        <h1 className="text-xl font-semibold">AI Review Assistant</h1>

        {health && (
          <p className="mt-4 text-sm">
            API: {health.status} — {health.service}
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-500">Error: {error}</p>}

        {!health && !error && (
          <p className="mt-4 text-sm text-muted-foreground">Checking API...</p>
        )}
      </div>
    </main>
  );
}
