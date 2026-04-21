import Link from "next/link";
import { Item, CATEGORY_COLORS, CATEGORY_LABELS, SOURCE_LABELS } from "@/lib/supabase";
import clsx from "clsx";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedCard({ item }: { item: Item }) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={clsx(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-600"
          )}
        >
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <span className="text-xs text-gray-400 shrink-0">
          {SOURCE_LABELS[item.source] ?? item.source} · {timeAgo(item.published_at)}
        </span>
      </div>

      <div>
        <Link
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 leading-snug hover:text-brand transition-colors"
        >
          {item.headline}
        </Link>
        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{item.summary}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <Link
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand font-medium hover:underline"
        >
          Read more →
        </Link>
        <span
          className="text-xs text-gray-400"
          title={`AI relevance score: ${item.score}/10`}
        >
          ★ {item.score}/10
        </span>
      </div>
    </article>
  );
}
