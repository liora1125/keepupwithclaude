"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/supabase";

type Submission = {
  id: string;
  created_at: string;
  url: string;
  submitter_name: string | null;
  note: string | null;
  headline: string;
  summary: string;
  category: string;
  score: number;
  score_reason: string;
  status: "pending" | "approved" | "rejected";
};

export default function CommunityPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");

  async function load() {
    const data = await fetch("/api/admin/community").then((r) => r.json());
    setSubmissions(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    await fetch("/api/admin/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function reject(id: string) {
    await fetch("/api/admin/community", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const filtered = submissions.filter((s) => s.status === filter);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Community Submissions
          {pendingCount > 0 && (
            <span className="ml-2 text-sm bg-brand text-white px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </h1>
        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx("px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize",
                filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No {filter} submissions</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", CATEGORY_COLORS[sub.category] ?? "bg-gray-100 text-gray-600")}>
                    {CATEGORY_LABELS[sub.category] ?? sub.category}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">★ {sub.score}/10</span>
                  <span className="text-xs text-gray-400">{sub.score_reason}</span>
                </div>
                {sub.submitter_name && (
                  <span className="text-xs text-gray-400 shrink-0">from {sub.submitter_name}</span>
                )}
              </div>

              <div>
                <p className="font-semibold text-gray-900">{sub.headline}</p>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{sub.summary}</p>
              </div>

              {sub.note && (
                <p className="text-sm text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">"{sub.note}"</p>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <a href={sub.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-gray-600 truncate max-w-xs">
                  {sub.url}
                </a>
                {sub.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => reject(sub.id)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 transition-colors">
                      Reject
                    </button>
                    <button onClick={() => approve(sub.id)}
                      className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
                      Approve & publish
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
