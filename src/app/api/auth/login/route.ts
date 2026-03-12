import { NextResponse } from "next/server";

const PASSWORD_COOKIE = "sagd_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  const correctPassword = process.env.AUTH_PASSWORD ?? "";
  const cookieToken = process.env.AUTH_TOKEN ?? "";

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set(PASSWORD_COOKIE, cookieToken, {
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
