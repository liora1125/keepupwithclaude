"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { CATEGORY_LABELS, Category } from "@/lib/supabase";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

const SORT_OPTIONS = [
  { value: "date", label: "Latest" },
  { value: "score", label: "Top rated" },
];

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const activeCategory = (params.get("category") ?? "all") as Category;
  const activeSort = params.get("sort") ?? "date";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    if (key === "category") next.delete("page");
    router.push(`/feed?${next.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
  );
}
