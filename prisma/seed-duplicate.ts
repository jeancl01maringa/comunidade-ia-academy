import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

// Load .env
dotenv.config()

async function main() {
    console.log("Iniciando duplicação de imagens...")

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        console.error("DATABASE_URL não encontrada no process.env")
        process.exit(1)
    }

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    try {
        // 1. Buscar imagens existentes do "Ensaio"
        const existingImages = await prisma.image.findMany({
            where: {
                category: { name: 'Ensaio' }
            }
        })

        if (existingImages.length === 0) {
            console.error("Nenhuma imagem encontrada para duplicar.")
            return
        }

        console.log(`Encontradas ${existingImages.length} imagens originais.`)

        // 2. Criar 20 cópias (ciclando pelas originais)
        for (let i = 0; i < 20; i++) {
            const original = existingImages[i % existingImages.length]

            await prisma.image.create({
                data: {
                    title: `${original.title} (Cópia ${i + 1})`,
                    prompt: original.prompt,
                    url: original.url,
                    categoryId: original.categoryId,
                    aiModelId: original.aiModelId,
                    userId: original.userId,
                    visible: true,
                    status: "APPROVED"
                }
            })
            console.log(`Duplicada: ${original.title} -> Cópia ${i + 1}`)
        }

        console.log("Duplicação finalizada com sucesso!")
    } catch (error: any) {
        console.error("ERRO NA DUPLICAÇÃO:")
        console.error(error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
