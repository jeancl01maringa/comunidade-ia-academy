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

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_imageId: { userId, imageId }
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            })
        } else {
            await prisma.like.create({
                data: { userId, imageId }
            })
        }

        const count = await prisma.like.count({
            where: { imageId }
        })

        return NextResponse.json({ count })
    } catch (error) {
        console.error("Like tracking error:", error)
        return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
    }
}
