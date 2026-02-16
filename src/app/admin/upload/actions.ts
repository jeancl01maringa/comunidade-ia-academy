"use server"

import { supabaseAdmin } from "@/lib/supabase"

const uploadSchema = z.object({
    title: z.string().optional(),
    prompt: z.string().min(3, "Prompt é obrigatório"),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    aiModelId: z.string().optional(),
})

export async function uploadImage(prevState: any, formData: FormData) {
    try {
        const title = formData.get("title") as string
        const prompt = formData.get("prompt") as string
        const categoryId = formData.get("categoryId") as string
        const aiModelId = formData.get("aiModelId") as string
        const imageFile = formData.get("image") as File
        const optimizedImage = formData.get("optimizedImage") as string

        if (!optimizedImage && (!imageFile || imageFile.size === 0)) {
            return { message: "Imagem é obrigatória" }
        }

        let finalUrl = ""

        // Process and Upload to Supabase Storage
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

        let buffer: Buffer
        if (optimizedImage) {
            // optimizedImage is a base64 string: data:image/webp;base64,...
            const base64Data = optimizedImage.split(",")[1]
            buffer = Buffer.from(base64Data, "base64")
        } else {
            const arrayBuffer = await imageFile.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
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
            return { message: "Erro ao salvar imagem no storage." }
        }

        // Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from("images")
            .getPublicUrl(fileName)

        finalUrl = publicUrl

        const validation = uploadSchema.safeParse({
            title,
            prompt,
            categoryId,
            aiModelId,
        })

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors
            return { message: "Erro de validação", errors }
        }

        // Get current user session
        const session = await getServerSession(authOptions)
        const userId = session?.user?.id || null

        await prisma.image.create({
            data: {
                title,
                prompt,
                categoryId,
                aiModelId: aiModelId || null,
                userId,
                url: finalUrl,
                visible: true,
                status: "APPROVED"
            },
        })

        revalidatePath("/admin/upload")
        revalidatePath("/")
        return { success: true, message: "Upload realizado com sucesso!" }
    } catch (error) {
        console.error(error)
        return { message: "Erro interno ao salvar imagem." }
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
