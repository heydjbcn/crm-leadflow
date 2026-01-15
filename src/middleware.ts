import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the user from StackAuth
  const user = await stackServerApp.getUser();

  // Public routes that don't require authentication
  const publicPaths = ["/handler", "/login", "/api/public"];
  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that are public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
