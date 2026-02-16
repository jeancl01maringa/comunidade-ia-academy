import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            status: string
            expiresAt: Date | null
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        status: string
        expiresAt: Date | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
        status: string
        expiresAt: Date | null
    }
}
