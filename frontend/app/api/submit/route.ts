import { NextRequest } from "next/server";
import { fetchAndScore } from "@/lib/score-url";
import { getServiceClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { url, submitter_name, note } = await req.json();
  if (!url) return Response.json({ error: "URL required" }, { status: 400 });

  // Score with Claude
  const result = await fetchAndScore(url);
  if (!result) {
    return Response.json({ error: "Could not fetch or score this URL. Check the link and try again." }, { status: 422 });
  }

  const db = getServiceClient();
  const { error } = await db.from("community_submissions").insert({
    url,
    submitter_name: submitter_name || null,
    note: note || null,
    headline: result.headline,
    summary: result.summary,
    category: result.category,
    score: result.score,
    score_reason: result.score_reason,
    status: "pending",
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    ok: true,
    preview: {
      headline: result.headline,
      summary: result.summary,
      category: result.category,
      score: result.score,
    },
  });
}
