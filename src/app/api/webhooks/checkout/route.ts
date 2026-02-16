import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        // Simple API Key security
        const apiKey = req.headers.get("x-api-key")
        if (apiKey !== process.env.CHECKOUT_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { email, name } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 200 })
        }

        // Create user with default password
        const defaultPassword = "Comunidade123!" // You might want to make this configurable
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        const newUser = await prisma.user.create({
            data: {
                email,
                name: name || email.split("@")[0],
                password: hashedPassword,
                role: "USER",
            },
        })

        return NextResponse.json(
            { message: "User created successfully", userId: newUser.id },
            { status: 201 }
        )
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
