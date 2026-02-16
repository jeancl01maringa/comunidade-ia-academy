import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const samples = [
    {
        title: "Retrato Minimalista de Verão",
        prompt: "A high-end editorial portrait of a young woman in light linen clothing, soft golden hour sunlight, minimalist background, 8k resolution, professional color grading.",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Arquitetura Orgânica Moderna",
        prompt: "Architectural photography of a desert oasis villa, curved white walls, palm shadows, luxury resort aesthetic, professional composition.",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Natureza Morta: Luxo e Vidro",
        prompt: "Still life photography of designer perfume bottles on a marble surface, refraction through crystal, soft focus, high fashion aesthetic.",
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Paisagem Etérea na Islândia",
        prompt: "Professional travel photography of a black sand beach with ice diamonds, dramatic moody sky, long exposure, cinematic atmosphere.",
        url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Editorial de Moda Urbana",
        prompt: "Street style editorial, model in oversized avant-garde clothing, brutalist concrete background, high contrast, vogue magazine style.",
        url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Gastronomia Fine Dining",
        prompt: "Close-up of a gourmet dish, liquid nitrogen smoke, dark elegant plating, professional food photography, Michelin star aesthetic.",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Interior Design: Escandinavo",
        prompt: "Cozy minimalist living room, wooden textures, soft beige color palette, architectural digest magazine style, daylight.",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Retrato Cinematográfico Noturno",
        prompt: "Cinematic night portrait, neon reflections on a rainy street, bokeh lights, blade runner aesthetic, professional film photography.",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Abstrato: Texturas de Rocha",
        prompt: "Macro photography of sedimentary rock layers, natural patterns, earth tones, abstract art by nature, high detail texture.",
        url: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1000&auto=format&fit=crop"
    },
    {
        title: "Automóvel Clássico Minimal",
        prompt: "Studio shot of a vintage Porsche 911, silhouette lighting, silver metallic paint, minimalist composition, automotive posters style.",
        url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop"
    }
]

async function main() {
    console.log("Iniciando seed de amostras (Com Adaptador)...")

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

    // 3. Inserir Imagens
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
}

main()
    .catch(e => {
        console.error("ERRO NO SEED:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
