"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getMembers(page = 1, pageSize = 20, query = "") {
    const where = {
        role: "USER",
        ...(query && {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
            ]
        })
    }

    const [members, total] = await Promise.all([
        prisma.user.findMany({
            where: (where as any),
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        }),
        prisma.user.count({ where: (where as any) })
    ])

    return { members, total }
}

export async function getMemberDetails(id: string) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            payments: {
                orderBy: { createdAt: "desc" }
            }
        }
    })
}

export async function updateMemberStatus(id: string, status: string, expiresAt?: Date) {
    try {
        await prisma.user.update({
            where: { id },
            data: {
                status,
                ...(expiresAt && { expiresAt })
            }
        })
        revalidatePath("/admin/membros")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao atualizar status do membro" }
    }
}

export async function createManualUser(formData: FormData) {
    try {
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const access = formData.get("access") as string
        const duration = formData.get("duration") as string // "7days", "1month", "1year"
        const passwordInput = formData.get("password") as string || "academy@123"

        if (!email || !name) {
            return { error: "Nome e e-mail são obrigatórios." }
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return { error: "Este e-mail já está em uso na plataforma." }
        }

        let expiresAt: Date | null = null

        if (access === "PREMIUM") {
            expiresAt = new Date()
            if (duration === "1day") expiresAt.setDate(expiresAt.getDate() + 1)
            else if (duration === "7days") expiresAt.setDate(expiresAt.getDate() + 7)
            else if (duration === "1month") expiresAt.setMonth(expiresAt.getMonth() + 1)
            else if (duration === "1year") expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        }

        const hashedPassword = await bcrypt.hash(passwordInput, 10)

        // Parse Database Role
        let dbRole = "USER"
        if (access === "ADMIN") dbRole = "ADMIN"
        if (access === "DESIGNER_ADMIN") dbRole = "DESIGNER_ADMIN"
        if (access === "DESIGNER") dbRole = "DESIGNER"

        // Find or create a default plan for the subscription
        let plan = await prisma.plan.findFirst({ where: { isActive: true } })
        if (!plan && access === "PREMIUM") {
            const planCount = await prisma.plan.count()
            const nameSuffix = planCount > 0 ? ` ${planCount + 1}` : ""
            plan = await prisma.plan.create({
                data: {
                    name: `Plano Premium${nameSuffix}`,
                    price: 0,
                    isActive: true,
                    description: "Plano criado para assinantes manuais"
                }
            })
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone: phone || null,
                password: hashedPassword,
                origin: "MANUAL",
                role: dbRole,
                status: "ACTIVE",
                expiresAt,
            }
        })

        if (access === "PREMIUM" && plan) {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    startDate: new Date(),
                    endDate: expiresAt
                }
            })
        }

        revalidatePath("/admin/membros")
        revalidatePath("/admin/subscribers")

        return { success: true }
    } catch (error: any) {
        console.error("Erro ao criar usuário:", error)
        return { error: "Ocorreu um erro interno ao criar o usuário." }
    }
}

export async function updateManualUser(formData: FormData) {
    try {
        const id = formData.get("id") as string
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const access = formData.get("access") as string
        const duration = formData.get("duration") as string
        const passwordInput = formData.get("password") as string

        if (!id || !email || !name) {
            return { error: "ID, nome e e-mail são obrigatórios." }
        }

        const existingUser = await prisma.user.findFirst({
            where: { email, id: { not: id } }
        })

        if (existingUser) {
            return { error: "Este e-mail já pertence a outro usuário." }
        }

        let expiresAt: Date | null = null

        if (access === "PREMIUM") {
            const currentUser = await prisma.user.findUnique({ where: { id } })
            expiresAt = currentUser?.expiresAt ? new Date(currentUser.expiresAt) : new Date()

            if (duration === "1day") expiresAt.setDate(new Date().getDate() + 1)
            else if (duration === "7days") expiresAt.setDate(new Date().getDate() + 7)
            else if (duration === "1month") expiresAt.setMonth(new Date().getMonth() + 1)
            else if (duration === "1year") expiresAt.setFullYear(new Date().getFullYear() + 1)
        }

        // Parse Database Role
        let dbRole = "USER"
        if (access === "ADMIN") dbRole = "ADMIN"
        if (access === "DESIGNER_ADMIN") dbRole = "DESIGNER_ADMIN"
        if (access === "DESIGNER") dbRole = "DESIGNER"

        const updateData: any = {
            name,
            email,
            phone: phone || null,
            role: dbRole,
            expiresAt: access === "PREMIUM" ? expiresAt : null,
        }

        if (passwordInput && passwordInput.trim().length > 0) {
            updateData.password = await bcrypt.hash(passwordInput, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        })

        if (access === "PREMIUM") {
            const hasActiveSub = await prisma.subscription.findFirst({
                where: { userId: id, status: "ACTIVE" }
            })

            if (!hasActiveSub) {
                let plan = await prisma.plan.findFirst({ where: { isActive: true } })
                if (!plan) {
                    plan = await prisma.plan.create({
                        data: {
                            name: "Plano Premium Manual",
                            price: 0,
                            isActive: true,
                        }
                    })
                }
                await prisma.subscription.create({
                    data: {
                        userId: id,
                        planId: plan.id,
                        status: "ACTIVE",
                        startDate: new Date(),
                        endDate: expiresAt
                    }
                })
            } else {
                await prisma.subscription.updateMany({
                    where: { userId: id, status: "ACTIVE" },
                    data: { endDate: expiresAt }
                })
            }
        }

        revalidatePath("/admin/membros")
        revalidatePath("/admin/subscribers")

        return { success: true }
    } catch (error: any) {
        console.error("Erro ao atualizar usuário:", error)
        return { error: "Ocorreu um erro interno ao atualizar o usuário." }
    }
}
