const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        },
    },
})

console.log('Database URL check:', process.env.DATABASE_URL ? 'Loaded' : 'NOT FOUND')

async function main() {
    const email = 'jean.maringa@hotmail.com'
    const password = 'academy@123'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Updating/Creating Admin: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE'
        },
        create: {
            email,
            name: 'Jean Maringa',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE'
        }
    })

    console.log('Admin user updated successfully:', user.email)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
