import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

export async function GET() {
  const db = getServiceClient();
  const { data, error } = await db
    .from("follows")
    .select("*")
    .order("sort_order");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, handle, description, url, type } = body;
  if (!name || !description || !url || !type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const db = getServiceClient();
  const { data, error } = await db
    .from("follows")
    .insert({ name, handle: handle || null, description, url, type })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const db = getServiceClient();
  const { error } = await db.from("follows").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
