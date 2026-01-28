import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("token")?.value;

  // Public routes yang tidak perlu authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/verifikasi-email",
    "/auth/callback",
  ];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/api/"),
  );

  // Jika tidak ada token dan bukan public route, redirect ke login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika ada token, decode untuk cek role (simplified - di production gunakan JWT verify)
  if (token) {
    try {
      // Decode payload dari JWT (bagian tengah)
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );

      const userRoles = payload.peran || [];

      // Route protection berdasarkan role
      if (pathname.startsWith("/penulis") && !userRoles.includes("penulis")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (pathname.startsWith("/editor") && !userRoles.includes("editor")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (pathname.startsWith("/admin") && !userRoles.includes("admin")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Redirect dari /dashboard/* ke role-specific route
      if (pathname.startsWith("/dashboard")) {
        // Tentukan redirect berdasarkan role utama
        if (userRoles.includes("admin")) {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (userRoles.includes("editor")) {
          return NextResponse.redirect(new URL("/editor", request.url));
        } else if (userRoles.includes("penulis")) {
          return NextResponse.redirect(new URL("/penulis", request.url));
        }
      }

      // Redirect dari root ke dashboard yang sesuai jika sudah login
      if (pathname === "/" && token) {
        if (userRoles.includes("admin")) {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (userRoles.includes("editor")) {
          return NextResponse.redirect(new URL("/editor", request.url));
        } else if (userRoles.includes("penulis")) {
          return NextResponse.redirect(new URL("/penulis", request.url));
        }
      }
    } catch (error) {
      // Jika token invalid, hapus dan redirect ke login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk routes yang perlu di-protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif).*)",
  ],
};
