import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.image.update({
            where: { id },
            data: { copyCount: { increment: 1 } }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Copy tracking error:", error)
        return NextResponse.json({ error: "Failed to track copy" }, { status: 500 })
    }
}
