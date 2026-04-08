"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function uploadToolLogo(formData: FormData) {
    const base64 = formData.get("imageBase64")?.toString()
    const toolId = formData.get("toolId")?.toString() || `tmp_${Date.now()}`

    if (!base64) return { success: false, message: "Imagem inválida." }

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    const supabase = getSupabase()
    const fileName = `${toolId}.webp`

    const { error } = await supabase.storage
        .from("tools")
        .upload(fileName, buffer, { contentType: "image/webp", upsert: true })

    if (error) return { success: false, message: "Erro no upload: " + error.message }

    const { data } = supabase.storage.from("tools").getPublicUrl(fileName)
    return { success: true, imageUrl: `${data.publicUrl}?t=${Date.now()}` }
}


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
