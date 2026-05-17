import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

import { sessionCookieName } from "@/lib/auth-constants";

const publicRoutes = new Set(["/", "/login", "/register"]);
const authRoutes = new Set(["/login", "/register"]);

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, getJwtSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthenticated = await hasValidSession(request);

  if (isPublicRoute) {
    if (isAuthenticated && authRoutes.has(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(sessionCookieName);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
