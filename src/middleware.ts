import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isExpired = token?.expiresAt && new Date(token.expiresAt) < new Date()
        const isBlocked = token?.status === "BLOCKED" || token?.status === "EXPIRED"

        // 1. Block unauthorized admin access based on strict RBAC
        const isAdminPath = req.nextUrl.pathname.startsWith("/admin")

        if (isAdminPath) {
            const role = token?.role || "USER"

            if (role === "USER") {
                return NextResponse.redirect(new URL("/", req.url))
            }

            if (role === "DESIGNER") {
                // Designers can ONLY view /admin/upload
                if (req.nextUrl.pathname !== "/admin/upload") {
                    return NextResponse.redirect(new URL("/admin/upload", req.url))
                }
            }

            if (role === "DESIGNER_ADMIN") {
                // Designer Admins can only view specific content directories
                const allowedPaths = [
                    "/admin",
                    "/admin/upload",
                    "/admin/categories",
                    "/admin/models",
                    "/admin/tools"
                ]

                const isAllowed = allowedPaths.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(`${p}/`))

                if (!isAllowed) {
                    return NextResponse.redirect(new URL("/admin/upload", req.url))
                }
            }
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
