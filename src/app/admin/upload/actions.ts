"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const uploadSchema = z.object({
    title: z.string().optional(),
    prompt: z.string().min(3, "Prompt é obrigatório"),
    instructions: z.string().optional(),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    aiModelId: z.string().optional(),
})

export async function uploadImage(prevState: any, formData: FormData) {
    try {
        const titleStr = formData.get("title")?.toString().trim() || undefined
        const promptStr = formData.get("prompt")?.toString().trim() || ""
        const instructionsStr = formData.get("instructions")?.toString().trim() || undefined
        const categoryIdStr = formData.get("categoryId")?.toString().trim() || ""
        const aiModelIdStr = formData.get("aiModelId")?.toString().trim() || undefined

        const imageFile = formData.get("image") as File | null
        const optimizedImage = formData.get("optimizedImage")?.toString() || ""

        // Parse support images (We expect them as optimizedSupport_0, optimizedSupport_1, etc.)
        const supportImagesData: string[] = []
        for (let i = 0; i < 4; i++) {
            const supportImg = formData.get(`optimizedSupport_${i}`)?.toString()
            if (supportImg) supportImagesData.push(supportImg)
        }

        if (!optimizedImage && (!imageFile || imageFile.size === 0)) {
            return { success: false, message: "Imagem é obrigatória" }
        }

        const validation = uploadSchema.safeParse({
            title: titleStr,
            prompt: promptStr,
            instructions: instructionsStr,
            categoryId: categoryIdStr,
            aiModelId: aiModelIdStr === "none" ? undefined : aiModelIdStr, // Ignore "none"
        })

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors
            console.error("Validation failed:", errors)
            // Extract the first error message to show to the user
            const firstErrorKey = Object.keys(errors)[0]
            const firstErrorMsg = errors[firstErrorKey as keyof typeof errors]?.[0]
            return { success: false, message: `Erro: ${firstErrorMsg}` }
        }

        let finalUrl = ""
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

        let buffer: Buffer
        if (optimizedImage) {
            const base64Data = optimizedImage.split(",")[1]
            buffer = Buffer.from(base64Data, "base64")
        } else if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
        } else {
            return { success: false, message: "Falha ao ler arquivo da imagem" }
        }

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from("images")
            .upload(fileName, buffer, {
                contentType: "image/webp",
                upsert: true
            })

        if (uploadError) {
            console.error("Supabase Storage Error:", uploadError)
            return { success: false, message: "A verificação do Supabase falhou. O Bucket 'images' existe? Confira no painel." }
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from("images").getPublicUrl(fileName)
        finalUrl = publicUrl

        // Upload Support Images identically
        const supportImageUrls: string[] = []
        for (const supportB64 of supportImagesData) {
            const supName = `${Date.now()}-sup-${Math.random().toString(36).substring(7)}.webp`
            const supBuffer = Buffer.from(supportB64.split(",")[1], "base64")

            const { error: supError } = await supabaseAdmin.storage.from("images").upload(supName, supBuffer, {
                contentType: "image/webp",
                upsert: true
            })

            if (!supError) {
                const { data: { publicUrl: supUrl } } = supabaseAdmin.storage.from("images").getPublicUrl(supName)
                supportImageUrls.push(supUrl)
            }
        }

        const session = await getServerSession(authOptions)
        let userId = session?.user?.id || null

        // Verify if user actually exists in current DB (handles old session cookies)
        if (userId) {
            const userExists = await prisma.user.findUnique({ where: { id: userId } })
            if (!userExists) {
                userId = null
            }
        }

        // If aiModelId is empty or 'none', pass null to Prisma
        const finalAiModelId = (aiModelIdStr && aiModelIdStr !== "none" && aiModelIdStr !== "null") ? aiModelIdStr : null

        await prisma.image.create({
            data: {
                title: titleStr,
                prompt: promptStr,
                instructions: instructionsStr || null,
                supportImages: supportImageUrls,
                categoryId: categoryIdStr,
                aiModelId: finalAiModelId,
                userId,
                url: finalUrl,
                visible: true,
                status: "APPROVED"
            },
        })

        revalidatePath("/admin/upload")
        revalidatePath("/")
        return { success: true, message: "Upload realizado com sucesso! ✨" }
    } catch (error) {
        console.error("Critical Upload Error:", error)
        return { success: false, message: "Erro crítico no servidor ao salvar a imagem." }
    }
}

export async function toggleVisibility(id: string, currentStatus: boolean) {
    try {
        await prisma.image.update({
            where: { id },
            data: { visible: !currentStatus }
        })
        revalidatePath("/admin/upload")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao atualizar visibilidade" }
    }
}

export async function deleteImage(id: string) {
    try {
        await prisma.image.delete({
            where: { id }
        })
        revalidatePath("/admin/upload")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        return { error: "Erro ao excluir imagem" }
    }
}

export async function updateImage(id: string, formData: FormData) {
    try {
        const titleStr = formData.get("title")?.toString().trim() || undefined
        const promptStr = formData.get("prompt")?.toString().trim() || ""
        const instructionsStr = formData.get("instructions")?.toString().trim() || undefined
        const categoryIdStr = formData.get("categoryId")?.toString().trim() || ""
        const aiModelIdStr = formData.get("aiModelId")?.toString().trim() || undefined
        const replaceMainB64 = formData.get("optimizedImage")?.toString() || null
        const finalAiModelId = (aiModelIdStr && aiModelIdStr !== "none" && aiModelIdStr !== "null") ? aiModelIdStr : null

        // Patch text fields
        const updateData: any = {
            title: titleStr || null,
            prompt: promptStr,
            instructions: instructionsStr || null,
            categoryId: categoryIdStr,
            aiModelId: finalAiModelId,
        }

        // Optionally replace main image
        if (replaceMainB64) {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
            const buffer = Buffer.from(replaceMainB64.split(",")[1], "base64")
            const { error } = await supabaseAdmin.storage.from("images").upload(fileName, buffer, {
                contentType: "image/webp", upsert: true
            })
            if (!error) {
                const { data: { publicUrl } } = supabaseAdmin.storage.from("images").getPublicUrl(fileName)
                updateData.url = publicUrl
            }
        }

        // Replace support images if any new ones were provided
        const newSupportData: string[] = []
        for (let i = 0; i < 4; i++) {
            const b64 = formData.get(`optimizedSupport_${i}`)?.toString()
            if (b64) newSupportData.push(b64)
        }
        if (newSupportData.length > 0) {
            const newUrls: string[] = []
            for (const b64 of newSupportData) {
                const supName = `${Date.now()}-sup-${Math.random().toString(36).substring(7)}.webp`
                const supBuffer = Buffer.from(b64.split(",")[1], "base64")
                const { error: supErr } = await supabaseAdmin.storage.from("images").upload(supName, supBuffer, {
                    contentType: "image/webp", upsert: true
                })
                if (!supErr) {
                    const { data: { publicUrl } } = supabaseAdmin.storage.from("images").getPublicUrl(supName)
                    newUrls.push(publicUrl)
                }
            }
            updateData.supportImages = newUrls
        }

        await prisma.image.update({ where: { id }, data: updateData })
        revalidatePath("/admin/upload")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("updateImage error:", error)
        return { success: false, message: "Erro ao atualizar imagem." }
    }
}

