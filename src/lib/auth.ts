import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                })

                if (!user || !user.password) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    expiresAt: user.expiresAt,
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.role = token.role
                session.user.status = token.status
                session.user.expiresAt = token.expiresAt
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.status = user.status
                token.expiresAt = user.expiresAt
            }
            return token
        },
    },
}
