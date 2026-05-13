import { NextResponse } from "next/server";

export function middleware(req) {
  const path = req.nextUrl.pathname;

  // Never block Next.js internal files
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Only geoblock public calendar pages
  const isCalendarPage = path.startsWith("/group/");

  if (isCalendarPage) {
    const country = req.headers.get("x-vercel-ip-country");

    if (country !== "CH") {
      return new NextResponse(
  `Only accessible from Switzerland. Detected country: ${country || "unknown"}`,
  { status: 403 }
);
    }
  }

  return NextResponse.next();
}
