import { NextResponse } from "next/server";

const CORRECT_PASSWORD = "ILOVECOCK";
const PASSWORD_COOKIE = "sagd_auth";
const COOKIE_TOKEN = "a]3#fK9$mQ";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (password === CORRECT_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(PASSWORD_COOKIE, COOKIE_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
}
