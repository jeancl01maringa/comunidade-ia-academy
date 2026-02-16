"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password || !name) {
        return { error: "Todos os campos são obrigatórios" }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "Este e-mail já está em uso" }
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER"
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Erro ao registrar usuário:", error)
        return { error: "Ocorreu um erro ao criar sua conta. Tente novamente." }
    }
}
