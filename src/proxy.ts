import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isProd = process.env.NODE_ENV === "production";

    // Admin routes protection
    if (pathname.startsWith("/admin")) {
        // Allow login page without auth
        if (pathname === "/admin/login") return NextResponse.next();

        const adminToken = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd
                ? "emm-admin.session-token"
                : "emm-admin.session-token",
        });

        // Check if user is authenticated and has ADMIN role
        if (!adminToken || (adminToken as any).role !== "ADMIN") {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }

        return NextResponse.next();
    }

    // Protected user routes
    const protectedUserRoutes = ["/trips", "/reservations", "/profile"];
    if (protectedUserRoutes.some(route => pathname.startsWith(route))) {
        const userToken = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd
                ? "emm-user.session-token"
                : "emm-user.session-token",
        });

        if (!userToken) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/trips/:path*", "/reservations/:path*", "/profile/:path*"],
};
