"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createCategorySchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
})

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string

    const validation = createCategorySchema.safeParse({ name })

    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors.name?.[0] }
    }

    try {
        await prisma.category.create({
            data: {
                name,
            },
        })
        revalidatePath("/admin/categories")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao criar categoria." }
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id },
        })
        revalidatePath("/admin/categories")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao excluir categoria." }
    }
}
