import { NextResponse } from "next/server";

export function middleware(req) {
  const country =
    req.headers.get("x-vercel-ip-country");

  const path = req.nextUrl.pathname;

  const isCalendar =
    !path.startsWith("/api") &&
    path !== "/" &&
    path !== "/favicon.ico";

  if (isCalendar && country !== "CH") {
    return new NextResponse(
      "Only accessible from Switzerland",
      { status: 403 }
    );
  }

  return NextResponse.next();
}
