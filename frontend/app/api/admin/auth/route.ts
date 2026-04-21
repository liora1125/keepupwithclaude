import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || password !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `admin_token=${process.env.ADMIN_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
  return res;
}

export async function DELETE() {
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", "admin_token=; Path=/; HttpOnly; Max-Age=0");
  return res;
}
