"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
