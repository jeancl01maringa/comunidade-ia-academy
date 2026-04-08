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
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: imageId } = await params
        const userId = session.user.id

        const existingSave = await prisma.save.findUnique({
            where: {
                userId_imageId: { userId, imageId }
            }
        })

        if (existingSave) {
            await prisma.save.delete({
                where: { id: existingSave.id }
            })
        } else {
            await prisma.save.create({
                data: { userId, imageId }
            })
        }

        const count = await prisma.save.count({
            where: { imageId }
        })

        return NextResponse.json({ count })
    } catch (error) {
        console.error("Save tracking error:", error)
        return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 })
    }
}
