import Link from "next/link";
import { supabase } from "@/lib/supabase";
import clsx from "clsx";

type Follow = {
  id: string;
  name: string;
  handle: string | null;
  description: string;
  url: string;
  type: "x" | "newsletter" | "youtube";
};

const TYPE_LABELS = { x: "X", newsletter: "Newsletter", youtube: "YouTube" };
const TYPE_COLORS = {
  x: "text-gray-400",
  newsletter: "text-blue-400",
  youtube: "text-red-400",
};

async function getFollows(): Promise<Follow[]> {
  const { data } = await supabase.from("follows").select("*").order("sort_order");
  return data ?? [];
}

export default async function WorthFollowing() {
  const follows = await getFollows();
  const byType = {
    x: follows.filter((f) => f.type === "x"),
    newsletter: follows.filter((f) => f.type === "newsletter"),
    youtube: follows.filter((f) => f.type === "youtube"),
  };

  if (follows.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Worth following</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(["x", "newsletter", "youtube"] as Follow["type"][]).map((type) => (
          <div key={type}>
            <h3 className={clsx("text-xs font-semibold uppercase tracking-wider mb-3", TYPE_COLORS[type])}>
              {TYPE_LABELS[type]}
            </h3>
            <div className="flex flex-col gap-3">
              {byType[type].map((follow) => (
                <Link key={follow.id} href={follow.url} target="_blank" rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{follow.name}</span>
                    {follow.handle && <span className="text-xs text-gray-400 shrink-0">{follow.handle}</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{follow.description}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
