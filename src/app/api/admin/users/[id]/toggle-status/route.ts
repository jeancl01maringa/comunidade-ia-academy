import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const user = await prisma.user.findUnique({ where: { id } })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE"

        await prisma.user.update({
            where: { id },
            data: { status: newStatus }
        })

        return NextResponse.json({ success: true, status: newStatus })
    } catch (error) {
        console.error("Toggle status error:", error)
        return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 })
    }
}
