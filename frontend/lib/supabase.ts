import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  source: string;
  source_url: string;
  headline: string;
  summary: string;
  category: "update" | "workflow" | "tool" | "tip" | "research" | "community";
  score: number;
  published_at: string;
  content_date: string;
  image_url: string | null;
};

export type Category = Item["category"] | "all";

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  update: "Update",
  workflow: "Workflow",
  tool: "Tool",
  tip: "Tip",
  research: "Research",
  community: "Community",
};

export const CATEGORY_COLORS: Record<string, string> = {
  update: "bg-blue-100 text-blue-700",
  workflow: "bg-green-100 text-green-700",
  tool: "bg-purple-100 text-purple-700",
  tip: "bg-yellow-100 text-yellow-700",
  research: "bg-indigo-100 text-indigo-700",
  community: "bg-pink-100 text-pink-700",
};

export const SOURCE_LABELS: Record<string, string> = {
  anthropic_blog: "Anthropic Blog",
  anthropic_changelog: "Anthropic Changelog",
  twitter: "X / Twitter",
  youtube: "YouTube",
  producthunt: "Product Hunt",
  github: "GitHub",
  newsletter_bensbites: "Ben's Bites",
  newsletter_tldr_ai: "TLDR AI",
  newsletter_therundown: "The Rundown",
};
