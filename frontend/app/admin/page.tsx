"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CATEGORY_COLORS, CATEGORY_LABELS, SOURCE_LABELS } from "@/lib/supabase";

type AdminItem = {
  id: string;
  source: string;
  headline: string;
  score: number;
  category: string;
  published_at: string | null;
  manually_hidden: boolean;
  created_at: string;
  source_url: string;
};

type Filter = "all" | "queued" | "published" | "hidden";

export default function AdminItemsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [editScore, setEditScore] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/items")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  async function patch(id: string, updates: object) {
    await fetch("/api/admin/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    const updated = await fetch("/api/admin/items").then((r) => r.json());
    setItems(updated);
  }

  const filtered = items.filter((item) => {
    if (filter === "queued") return !item.published_at && !item.manually_hidden;
    if (filter === "published") return !!item.published_at && !item.manually_hidden;
    if (filter === "hidden") return item.manually_hidden;
    return true;
  });

  const counts = {
    all: items.length,
    queued: items.filter((i) => !i.published_at && !i.manually_hidden).length,
    published: items.filter((i) => !!i.published_at && !i.manually_hidden).length,
    hidden: items.filter((i) => i.manually_hidden).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Items</h1>
        <div className="flex gap-2">
          {(["all", "queued", "published", "hidden"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize",
                filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Item</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-28">Status</th>
                <th className="px-4 py-3 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => {
                const isPublished = !!item.published_at && !item.manually_hidden;
                const isHidden = item.manually_hidden;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className={clsx("text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5", CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-600")}>
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                        <div>
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-brand line-clamp-1">
                            {item.headline}
                          </a>
                          <p className="text-gray-400 text-xs mt-0.5">{SOURCE_LABELS[item.source] ?? item.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editScore[item.id] ?? item.score}
                        onChange={(e) => setEditScore((s) => ({ ...s, [item.id]: parseInt(e.target.value) }))}
                        onBlur={() => {
                          const s = editScore[item.id];
                          if (s && s !== item.score) patch(item.id, { score: s });
                        }}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx("text-xs font-medium", isHidden ? "text-red-500" : isPublished ? "text-green-600" : "text-yellow-600")}>
                        {isHidden ? "Hidden" : isPublished ? "Published" : "Queued"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => patch(item.id, { published: !isPublished })}
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-gray-400 text-gray-600 transition-colors"
                        >
                          {isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => patch(item.id, { hidden: !isHidden })}
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-gray-400 text-gray-600 transition-colors"
                        >
                          {isHidden ? "Unhide" : "Hide"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No items</p>
          )}
        </div>
      )}
    </div>
  );
}
