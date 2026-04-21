"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/supabase";

type Preview = {
  headline: string;
  summary: string;
  category: string;
  score: number;
};

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, submitter_name: name, note }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
    } else {
      setPreview(data.preview);
      setDone(true);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-8 inline-block">
        ← Keep Up With Claude
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Share something cool</h1>
      <p className="text-gray-500 text-sm mb-8">
        Found a great Claude workflow, demo, or use case? Submit it and we'll review it for the feed.
      </p>

      {done && preview ? (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[preview.category] ?? "bg-gray-100 text-gray-600")}>
                {CATEGORY_LABELS[preview.category] ?? preview.category}
              </span>
              <span className="text-sm font-semibold text-gray-900">★ {preview.score}/10</span>
            </div>
            <p className="font-semibold text-gray-900">{preview.headline}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{preview.summary}</p>
          </div>

          <div className="text-center">
            <p className="text-green-600 font-medium mb-1">Submitted — thanks!</p>
            <p className="text-sm text-gray-400 mb-4">We'll review it and add it to the feed if it's a good fit.</p>
            <button
              onClick={() => { setDone(false); setPreview(null); setUrl(""); setName(""); setNote(""); }}
              className="text-sm text-brand hover:underline"
            >
              Submit another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Link *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://x.com/... or https://youtube.com/..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Your name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah M."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Why is this worth sharing? <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief context on why this is useful..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? "Checking your link..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}
