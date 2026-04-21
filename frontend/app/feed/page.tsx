import { Suspense } from "react";
import { supabase, Item, Category } from "@/lib/supabase";
import FeedCard from "@/components/FeedCard";
import FilterBar from "@/components/FilterBar";
import NewsletterSignup from "@/components/NewsletterSignup";

const PAGE_SIZE = 18;

function periodStart(period: string): string | null {
  const now = new Date();
  if (period === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (period === "week") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }
  if (period === "month") {
    now.setDate(now.getDate() - 30);
    return now.toISOString();
  }
  return null;
}

async function getItems(category: Category, sort: string, period: string, page: number): Promise<Item[]> {
  let query = supabase
    .from("items")
    .select("*")
    .order(sort === "score" ? "score" : "published_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (category !== "all") query = query.eq("category", category);

  const start = periodStart(period);
  if (start) query = query.gte("published_at", start);

  const { data } = await query;
  return data ?? [];
}

export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<{ category?: string; sort?: string; period?: string; page?: string }>;
};

export default async function FeedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = (params.category ?? "all") as Category;
  const sort = params.sort ?? "date";
  const period = params.period ?? "all";
  const page = parseInt(params.page ?? "0", 10);

  const items = await getItems(category, sort, period, page);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">The Feed</h1>
        <p className="text-gray-500 text-sm">
          Updated daily. AI-scored and summarised from across the web.
        </p>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          No items found. Try a different filter or check back tomorrow.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        {page > 0 ? (
          <a
            href={`/feed?category=${category}&sort=${sort}&period=${period}&page=${page - 1}`}
            className="text-sm text-brand hover:underline"
          >
            ← Previous
          </a>
        ) : (
          <span />
        )}
        {items.length === PAGE_SIZE && (
          <a
            href={`/feed?category=${category}&sort=${sort}&period=${period}&page=${page + 1}`}
            className="text-sm text-brand hover:underline ml-auto"
          >
            Next →
          </a>
        )}
      </div>

      <NewsletterSignup />
    </div>
  );
}
