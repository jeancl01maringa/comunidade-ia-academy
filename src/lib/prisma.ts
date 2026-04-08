import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

console.log("Next.js Prisma DB URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":***@"))

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
