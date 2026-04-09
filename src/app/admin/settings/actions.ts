"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function uploadLogo(prevState: any, formData: FormData) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") {
            return { success: false, message: "Não autorizado" }
        }

        const optimizedImage = formData.get("optimizedImage")?.toString() || ""
        const imageFile = formData.get("logo") as File | null

        if (!optimizedImage && (!imageFile || imageFile.size === 0)) {
            return { success: false, message: "Imagem do logo é obrigatória" }
        }

        let finalUrl = ""
        const fileName = `brand/logo-${Date.now()}.webp`

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
            return { success: false, message: "Falha ao enviar logo para o Storage." }
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from("images").getPublicUrl(fileName)
        finalUrl = publicUrl

        const settingKey = formData.get("settingKey")?.toString() || "site_logo"

        // Upsert into SystemSetting
        await prisma.systemSetting.upsert({
            where: { key: settingKey },
            update: { value: finalUrl },
            create: { key: settingKey, value: finalUrl }
        })

        revalidatePath("/", "layout")
        return { success: true, message: "Logo atualizado com sucesso! ✨" }
    } catch (error) {
        console.error("Critical Logo Upload Error:", error)
        return { success: false, message: "Erro crítico no servidor ao salvar a imagem." }
    }
}
