import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from("items")
    .select("id, source, headline, score, category, published_at, manually_hidden, created_at, source_url")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function PATCH(req: NextRequest) {
  const { id, published, hidden, score } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const db = getServiceClient();
  const updates: Record<string, unknown> = {};

  if (typeof published === "boolean") {
    updates.published_at = published ? new Date().toISOString() : null;
  }
  if (typeof hidden === "boolean") {
    updates.manually_hidden = hidden;
  }
  if (typeof score === "number") {
    updates.score = score;
  }

  const { error } = await db.from("items").update(updates).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
