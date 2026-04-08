import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            email,
            name,
            phone,
            planName,
            endDate,
            origin,
            secret
        } = body

        // Basic security check
        const webhookSecret = process.env.CHECKOUT_WEBHOOK_SECRET || "secret123"
        if (secret !== webhookSecret) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // 1. Find or Create User
        let user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            const hashedPassword = await bcrypt.hash("academy@123", 10)
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    phone,
                    origin: origin || "WEBHOOK",
                    password: hashedPassword,
                    role: "USER",
                    status: "ACTIVE",
                    expiresAt: endDate ? new Date(endDate) : null
                }
            })
        } else {
            // Update existing user
            user = await prisma.user.update({
                where: { email },
                data: {
                    name: name || user.name,
                    phone: phone || user.phone,
                    origin: origin || user.origin,
                    status: "ACTIVE",
                    expiresAt: endDate ? new Date(endDate) : user.expiresAt
                }
            })
        }

        // 2. Find or Create Plan
        let plan = await prisma.plan.findUnique({
            where: { name: planName || "Premium" }
        })

        if (!plan) {
            plan = await prisma.plan.create({
                data: {
                    name: planName || "Premium",
                    price: 0, // Placeholder
                    interval: "year",
                    isActive: true
                }
            })
        }

        // 3. Create or Update Subscription
        const existingSub = await prisma.subscription.findFirst({
            where: { userId: user.id, planId: plan.id }
        })

        if (existingSub) {
            await prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                    status: "ACTIVE",
                    endDate: endDate ? new Date(endDate) : null
                }
            })
        } else {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    endDate: endDate ? new Date(endDate) : null
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: "User and subscription provisioned successfully",
            userId: user.id
        })

    } catch (error) {
        console.error("Provisioning error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
