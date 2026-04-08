import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/brevo"
import bcrypt from "bcryptjs"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ gateway: string }> }
) {
    const { gateway } = await params
    const gatewayId = gateway.toUpperCase()

    try {
        const body = await req.json()
        console.log(`Received ${gatewayId} Webhook:`, body)

        // 1. Get Integration Config
        const integration = await prisma.integration.findUnique({
            where: { gateway: gatewayId }
        })

        if (!integration || !integration.isActive) {
            return NextResponse.json({ error: "Gateway not configured or inactive" }, { status: 400 })
        }

        // 2. Validate Origin (Simple Hash check if provided)
        // Note: Real validation logic varies by gateway (Hmac for Kiwify/Hotmart)
        // Here we implement the core provisioning logic

        let userEmail = ""
        let userName = ""
        let status = "paid"
        let externalId = ""
        let amount = 0

        // Extract data based on gateway format
        if (gatewayId === "KIWIFY") {
            userEmail = body.customer?.email
            userName = body.customer?.full_name
            status = body.order_status // paid, refunded, canceled
            externalId = body.order_id
            amount = body.amount / 100
        } else if (gatewayId === "HOTMART") {
            userEmail = body.data?.buyer?.email
            userName = body.data?.buyer?.name
            status = body.event === "PURCHASE_APPROVED" ? "paid" : "other"
            externalId = body.data?.purchase?.transaction
            amount = body.data?.purchase?.price?.value
        } else if (gatewayId === "GREEN") {
            userEmail = body.email
            userName = body.name
            status = body.status === "paid" ? "paid" : "other"
            externalId = body.id
            amount = parseFloat(body.amount)
        }

        if (!userEmail || status !== "paid") {
            return NextResponse.json({ message: "Processed (Ignored status/missing data)" })
        }

        // 3. User & Access Provisioning
        const hashedPassword = await bcrypt.hash("ACADEMY@123", 10)
        const ONE_YEAR = new Date(new Date().setFullYear(new Date().getFullYear() + 1))

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Find or Create User
            const user = await tx.user.upsert({
                where: { email: userEmail },
                update: {
                    origin: gatewayId,
                    status: "ACTIVE",
                    expiresAt: ONE_YEAR
                },
                create: {
                    email: userEmail,
                    name: userName,
                    password: hashedPassword,
                    origin: gatewayId,
                    status: "ACTIVE",
                    expiresAt: ONE_YEAR
                }
            })

            // Record Payment
            await tx.payment.upsert({
                where: { externalId },
                update: { status: "paid" },
                create: {
                    externalId,
                    amount,
                    status: "paid",
                    gateway: gatewayId,
                    userId: user.id
                }
            })

            // Create or Update Subscription
            // For now we assign to the first plan found or create a default "Premium" plan if none exists
            let plan = await tx.plan.findFirst({
                where: { isActive: true }
            })

            if (!plan) {
                plan = await tx.plan.create({
                    data: {
                        name: "Premium",
                        price: amount,
                        features: ["Acesso Completo"],
                        interval: "year"
                    }
                })
            }

            await tx.subscription.create({
                data: {
                    userId: user.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    endDate: ONE_YEAR
                }
            })

            return user
        })

        // 4. Send Welcome Email (Non-blocking)
        if (result) {
            sendWelcomeEmail(userEmail, userName || "Estudante").catch(console.error)
        }

        return NextResponse.json({ success: true, userId: result.id })

    } catch (error) {
        console.error(`Webhook Error [${gatewayId}]:`, error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
