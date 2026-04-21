import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from("community_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  // Approve: publish the submission as an item
  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const db = getServiceClient();

  const { data: sub, error: fetchErr } = await db
    .from("community_submissions")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr || !sub) return Response.json({ error: "Submission not found" }, { status: 404 });

  const { data: item, error: insertErr } = await db
    .from("items")
    .upsert({
      source: "community",
      source_url: sub.url,
      original_title: sub.headline,
      headline: sub.headline,
      summary: sub.summary,
      category: sub.category,
      score: sub.score,
      score_reason: sub.score_reason,
      published_at: new Date().toISOString(),
      manually_hidden: false,
    }, { onConflict: "source_url" })
    .select()
    .single();

  if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 });

  await db.from("community_submissions").update({ status: "approved", item_id: item.id }).eq("id", id);

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const db = getServiceClient();
  await db.from("community_submissions").update({ status: "rejected" }).eq("id", id);
  return Response.json({ ok: true });
}
