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
  score_reason: string;
  source: string;
  source_url: string;
  published_at: string | null;
};

export default function SubmitPage() {
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

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setResult(data.item);
    }
  }

  async function handlePublish() {
    if (!result) return;
    await fetch("/api/admin/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: result.id, published: true }),
    });
    setPublished(true);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Submit URL</h1>
      <p className="text-sm text-gray-500">
        Paste any tweet, YouTube video, or article URL. Claude will score and summarise it.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://x.com/... or https://youtube.com/..."
          required
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-60 shrink-0"
        >
          {loading ? "Scoring..." : "Score"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[result.category] ?? "bg-gray-100 text-gray-600")}>
              {CATEGORY_LABELS[result.category] ?? result.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{result.score}/10</span>
              <span className="text-xs text-gray-400">{result.score_reason}</span>
            </div>
          </div>

          <div>
            <p className="font-semibold text-gray-900">{result.headline}</p>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{result.summary}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <a href={result.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600 truncate max-w-xs">
              {result.source_url}
            </a>
            {published ? (
              <span className="text-xs font-medium text-green-600">Published ✓</span>
            ) : (
              <button
                onClick={handlePublish}
                className="text-sm px-4 py-1.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
              >
                Publish now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
