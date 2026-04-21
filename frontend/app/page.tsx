import Link from "next/link";
import { supabase, Item } from "@/lib/supabase";
import FeedCard from "@/components/FeedCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import WorthFollowing from "@/components/WorthFollowing";

async function getLatestItems(): Promise<Item[]> {
  const { data } = await supabase
    .from("items")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(6);
  return data ?? [];
}

export const revalidate = 3600; // revalidate every hour

export default async function HomePage() {
  const items = await getLatestItems();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">
      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          Everything happening with Claude,{" "}
          <span className="text-brand">curated daily</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Updates, workflows, tools, and real-world use cases — pulled from across the internet and summarised so you don't have to chase them down.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/feed"
            className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            Browse the feed
          </Link>
          <Link
            href="#newsletter"
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            Get the weekly digest
          </Link>
        </div>
      </section>

      {/* Latest items */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Latest</h2>
          <Link href="/feed" className="text-sm text-brand hover:underline">
            See all →
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Content is being processed — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Worth Following */}
      <WorthFollowing />

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
