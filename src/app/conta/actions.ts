"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function updateProfile(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, message: "Não autenticado." }

    const name = formData.get("name")?.toString().trim()
    if (!name) return { success: false, message: "Nome é obrigatório." }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
    })

    revalidatePath("/conta")
    return { success: true }
}

export async function uploadProfilePhoto(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, message: "Não autenticado." }

    const base64 = formData.get("imageBase64")?.toString()
    if (!base64) return { success: false, message: "Imagem inválida." }

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    const supabase = getSupabase()
    const fileName = `${session.user.id}.webp`

    const { error } = await supabase.storage
        .from("profiles")
        .upload(fileName, buffer, {
            contentType: "image/webp",
            upsert: true,
        })

    if (error) return { success: false, message: "Erro ao fazer upload: " + error.message }

    const { data: urlData } = supabase.storage.from("profiles").getPublicUrl(fileName)
    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`

    await prisma.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl },
    })

    revalidatePath("/conta")
    return { success: true, imageUrl }
}

export async function changePassword(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, message: "Não autenticado." }

    const currentPassword = formData.get("currentPassword")?.toString()
    const newPassword = formData.get("newPassword")?.toString()
    const confirmPassword = formData.get("confirmPassword")?.toString()

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, message: "Preencha todos os campos." }
    }

    if (newPassword !== confirmPassword) {
        return { success: false, message: "As senhas não coincidem." }
    }

    if (newPassword.length < 6) {
        return { success: false, message: "A nova senha deve ter no mínimo 6 caracteres." }
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.password) return { success: false, message: "Usuário não possui senha cadastrada." }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return { success: false, message: "Senha atual incorreta." }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
    })

    return { success: true }
}
