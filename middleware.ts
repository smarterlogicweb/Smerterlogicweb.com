import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple protection for Sanity Studio using Basic Auth or token.
 * Configure one of:
 * - STUDIO_BASIC_AUTH_USER and STUDIO_BASIC_AUTH_PASS
 * - STUDIO_ACCESS_TOKEN (sent via query ?token=... or header x-studio-token)
 */
function protectStudio(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/studio")) return null;

  const tokenEnv = (process.env.STUDIO_ACCESS_TOKEN || "").trim();
  const basicUser = (process.env.STUDIO_BASIC_AUTH_USER || "").trim();
  const basicPass = (process.env.STUDIO_BASIC_AUTH_PASS || "").trim();

  // Allow token via query or header
  const headerToken = req.headers.get("x-studio-token") || "";
  const queryToken = req.nextUrl.searchParams.get("token") || "";
  const token = headerToken || queryToken;

  if (tokenEnv && token === tokenEnv) {
    return null; // ok
  }

  // Basic Auth
  if (basicUser && basicPass) {
    const auth = req.headers.get("authorization") || "";
    if (auth.startsWith("Basic ")) {
      try {
        const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString("utf8");
        const [u, p] = decoded.split(":");
        if (u === basicUser && p === basicPass) {
          return null; // ok
        }
      } catch {
        // fallthrough
      }
    }
    const res = new NextResponse("Unauthorized", { status: 401 });
    res.headers.set("WWW-Authenticate", 'Basic realm="Studio", charset="UTF-8"');
    return res;
  }

  // If no protection configured, allow
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect legacy manifest path
  if (pathname === "/site.webmanifest") {
    const url = req.nextUrl.clone();
    url.pathname = "/manifest.webmanifest";
    const res = NextResponse.redirect(url, 308);
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  }

  // Protect Sanity Studio
  const maybe = protectStudio(req);
  if (maybe) return maybe;

  return NextResponse.next();
}

export const config = {
  matcher: ["/site.webmanifest", "/studio/:path*"],
};