"use client";

import { useState } from "react";
import clsx from "clsx";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/supabase";

type Result = {
  id: string;
  headline: string;
  summary: string;
  category: string;
  score: number;
  source_url: string;
};

export default function QuickAddPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setPublished(false);

    const res = await fetch("/api/admin/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data.item);
    else setError(data.error || "Failed");
  }

  async function publish() {
    if (!result) return;
    await fetch("/api/admin/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: result.id, published: true }),
    });
    setPublished(true);
  }

  function reset() {
    setUrl("");
    setResult(null);
    setPublished(false);
    setError("");
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900">Quick add</h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a link..."
          required
          autoFocus
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500"
        />
        <button type="submit" disabled={loading}
          className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 shrink-0">
          {loading ? "..." : "Go"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[result.category] ?? "bg-gray-100 text-gray-600")}>
              {CATEGORY_LABELS[result.category] ?? result.category}
            </span>
            <span className="text-sm font-semibold text-gray-900">★ {result.score}/10</span>
          </div>
          <p className="font-semibold text-gray-900">{result.headline}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>

          <div className="flex gap-2 pt-1 border-t border-gray-100">
            {published ? (
              <>
                <span className="text-sm text-green-600 font-medium flex-1">Published ✓</span>
                <button onClick={reset} className="text-sm text-brand hover:underline">Add another</button>
              </>
            ) : (
              <>
                <button onClick={reset} className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 transition-colors">
                  Discard
                </button>
                <button onClick={publish}
                  className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
                  Publish now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
