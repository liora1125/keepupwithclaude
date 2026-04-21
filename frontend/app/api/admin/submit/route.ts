import { NextRequest } from "next/server";
import { fetchAndScore } from "@/lib/score-url";
import { getServiceClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return Response.json({ error: "URL required" }, { status: 400 });

  const result = await fetchAndScore(url);
  if (!result) {
    return Response.json({ error: "Could not fetch or score this URL" }, { status: 422 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("items")
    .upsert(
      {
        source: result.source,
        source_url: result.url,
        original_title: result.original_title,
        headline: result.headline,
        summary: result.summary,
        category: result.category,
        score: result.score,
        score_reason: result.score_reason,
        published_at: null,
        manually_hidden: false,
      },
      { onConflict: "source_url" }
    )
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, item: data });
}
