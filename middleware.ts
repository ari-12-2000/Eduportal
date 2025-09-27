export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const url = request.nextUrl

console.log('middleware request',request.url)

  const token = await getToken({ req: request })

  if (token) {
    // If already logged in → redirect away from /login
    if (url.pathname.startsWith("/login")) {
      const referer = request.headers.get('referer');
      const redirectUrl = referer ? new URL(referer) : new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    // Not logged in → block protected routes
    if (
      url.pathname.startsWith("/student") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/payment") || url.pathname.startsWith("/razorpay")|| url.pathname.startsWith("/purchase") ||
      (url.pathname.startsWith("/courses") && !url.pathname.startsWith("/courses/categories") && !url.pathname.startsWith("/courses/search"))
    ) {
      console.log('url pathname',url.pathname)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }


}

export const config = {
  matcher: [
    "/login",
    "/student/:path*",
    "/admin/:path*",
    "/payment/:path*",
    "/courses/:path*"
  ],
}
