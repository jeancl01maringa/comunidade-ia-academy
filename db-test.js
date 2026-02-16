const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
    console.log('Testing DB connection...')
    try {
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)

        const imageCount = await prisma.image.count()
        console.log('Image count:', imageCount)

        const categoryCount = await prisma.category.count()
        console.log('Category count:', categoryCount)

        console.log('DB Connection successful')
    } catch (e) {
        console.error('DB Error:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
