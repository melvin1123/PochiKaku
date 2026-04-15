import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  console.log("TOKEN:", token); // 👈 move here

  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

    if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!auth|register|$|_next/static|_next/image|favicon.ico|api).*)",
  ],    
};