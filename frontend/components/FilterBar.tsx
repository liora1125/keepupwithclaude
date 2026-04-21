"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CATEGORY_LABELS, Category } from "@/lib/supabase";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

const SORT_OPTIONS = [
  { value: "date", label: "Latest" },
  { value: "score", label: "Top rated" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = (params.get("category") ?? "all") as Category;
  const activeSort = params.get("sort") ?? "date";
  const activePeriod = params.get("period") ?? "all";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    next.delete("page");
    router.push(`/feed?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setParam("category", cat)}
            className={clsx(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Date + sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("period", opt.value)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                activePeriod === opt.value
                  ? "bg-brand text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sort", opt.value)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                activeSort === opt.value
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
