import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isExpired = token?.expiresAt && new Date(token.expiresAt) < new Date()
        const isBlocked = token?.status === "BLOCKED" || token?.status === "EXPIRED"

        // 1. Block unauthorized admin access
        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            token?.role !== "ADMIN"
        ) {
            return NextResponse.rewrite(new URL("/denied", req.url))
        }

        // 2. Block expired or restricted users from main areas
        if ((isExpired || isBlocked) && !req.nextUrl.pathname.startsWith("/account")) {
            return NextResponse.rewrite(new URL("/expired", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = { matcher: ["/admin/:path*"] }
