"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createModelSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
})

export async function createAIModel(formData: FormData) {
    const name = formData.get("name") as string

    const validation = createModelSchema.safeParse({ name })

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors.name?.[0] }
    }

    try {
        await prisma.aIModel.create({
            data: {
                name,
            },
        })
        revalidatePath("/admin/models")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao criar modelo. Verifique se já existe." }
    }
}

export async function deleteAIModel(id: string) {
    try {
        await prisma.aIModel.delete({
            where: { id },
        })
        revalidatePath("/admin/models")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao excluir modelo." }
    }
}
