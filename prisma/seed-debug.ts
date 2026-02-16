import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function main() {
    console.log("Iniciando seed de amostras (Debug)...")

    const connectionString = `${process.env.DATABASE_URL}`
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    const samples = [
        {
            title: "Retrato Minimalista de Verão",
            prompt: "A high-end editorial portrait of a young woman in light linen clothing, soft golden hour sunlight, minimalist background, 8k resolution, professional color grading.",
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
        }
    ]

    try {
        // 1. Garantir Categoria Ensaio
        const category = await prisma.category.upsert({
            where: { name: 'Ensaio' },
            update: {},
            create: { name: 'Ensaio' }
        })

        // 2. Garantir Modelo Freepik
        const model = await prisma.aiModel.upsert({
            where: { name: 'Freepik' },
            update: {},
            create: { name: 'Freepik' }
        })

        console.log(`Categoria: ${category.name} (${category.id})`)
        console.log(`Modelo: ${model.name} (${model.id})`)

        // 3. Inserir Imagem
        for (const sample of samples) {
            await prisma.image.create({
                data: {
                    title: sample.title,
                    prompt: sample.prompt,
                    url: sample.url,
                    categoryId: category.id,
                    aiModelId: model.id,
                    visible: true,
                    status: "APPROVED"
                }
            })
            console.log(`Inserido: ${sample.title}`)
        }

        console.log("Seeding finalizado com sucesso!")
    } catch (error: any) {
        console.error("ERRO DETALHADO NO SEED:")
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        if (error.cause) {
            console.error("CAUSE:")
            console.error(JSON.stringify(error.cause, Object.getOwnPropertyNames(error.cause), 2))
        }
        process.exit(1)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

main()
