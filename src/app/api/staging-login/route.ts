import { NextResponse } from "next/server";

const COOKIE_NAME = "wa_staging_access";

export async function POST(request: Request) {
  const { password, from } = await request.json().catch(() => ({ password: "", from: "/" }));

  if (!process.env.STAGING_PASSWORD || password !== process.env.STAGING_PASSWORD) {
    return NextResponse.json({ ok: false, error: "Password incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, redirectTo: from || "/" });
  res.cookies.set(COOKIE_NAME, "granted", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
