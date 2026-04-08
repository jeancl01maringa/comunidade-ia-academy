"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTool(formData: FormData) {
    const name = formData.get("name")?.toString().trim()
    const url = formData.get("url")?.toString().trim()
    const description = formData.get("description")?.toString().trim()
    const categoryId = formData.get("categoryId")?.toString().trim()
    const imageUrl = formData.get("imageUrl")?.toString().trim()
    const isNew = formData.get("isNew") === "true"
    const isActive = formData.get("isActive") !== "false"

    if (!name || !url) {
        return { success: false, message: "Nome e URL são obrigatórios." }
    }

    await prisma.tool.create({
        data: {
            name,
            url,
            description: description || null,
            imageUrl: imageUrl || null,
            categoryId: categoryId || null,
            isNew,
            isActive,
        }
    })

    revalidatePath("/admin/tools")
    revalidatePath("/design")
    return { success: true }
}

export async function updateTool(id: string, formData: FormData) {
    const name = formData.get("name")?.toString().trim()
    const url = formData.get("url")?.toString().trim()
    const description = formData.get("description")?.toString().trim()
    const categoryId = formData.get("categoryId")?.toString().trim()
    const imageUrl = formData.get("imageUrl")?.toString().trim()
    const isNew = formData.get("isNew") === "true"
    const isActive = formData.get("isActive") !== "false"

    await prisma.tool.update({
        where: { id },
        data: {
            name: name || undefined,
            url: url || undefined,
            description: description || null,
            imageUrl: imageUrl || null,
            categoryId: categoryId || null,
            isNew,
            isActive,
        }
    })

    revalidatePath("/admin/tools")
    revalidatePath("/design")
    return { success: true }
}

export async function deleteTool(id: string) {
    await prisma.tool.delete({ where: { id } })
    revalidatePath("/admin/tools")
    revalidatePath("/design")
    return { success: true }
}

export async function createToolCategory(formData: FormData) {
    const name = formData.get("name")?.toString().trim()
    const description = formData.get("description")?.toString().trim()

    if (!name) return { success: false, message: "Nome é obrigatório." }

    await prisma.toolCategory.create({
        data: { name, description: description || null }
    })

    revalidatePath("/admin/tools")
    return { success: true }
}

export async function deleteToolCategory(id: string) {
    await prisma.toolCategory.delete({ where: { id } })
    revalidatePath("/admin/tools")
    return { success: true }
}
