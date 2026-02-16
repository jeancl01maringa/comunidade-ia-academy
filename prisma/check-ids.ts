import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const category = await prisma.category.findUnique({
        where: { name: 'Ensaio' }
    })

    const model = await prisma.aiModel.findUnique({
        where: { name: 'Freepik' }
    })

    console.log(JSON.stringify({
        categoryId: category?.id || null,
        modelId: model?.id || null
    }))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
