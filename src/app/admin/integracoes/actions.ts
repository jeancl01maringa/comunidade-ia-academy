"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const integrationSchema = z.object({
    gateway: z.string(),
    apiKey: z.string().optional(),
    webhookSecret: z.string().optional(),
    isActive: z.boolean().default(false),
})

export async function updateIntegration(formData: FormData) {
    const gateway = formData.get("gateway") as string
    const apiKey = formData.get("apiKey") as string
    const webhookSecret = formData.get("webhookSecret") as string
    const isActive = formData.get("isActive") === "true"

    try {
        await prisma.integration.upsert({
            where: { gateway },
            update: {
                apiKey,
                webhookSecret,
                isActive,
            },
            create: {
                gateway,
                apiKey,
                webhookSecret,
                isActive,
            },
        })
        revalidatePath("/admin/integracoes")
        return { success: true }
    } catch (error) {
        console.error("Error updating integration:", error)
        return { error: "Erro ao atualizar integração" }
    }
}

export async function getIntegrations() {
    return await prisma.integration.findMany()
}
