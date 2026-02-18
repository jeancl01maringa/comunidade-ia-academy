const { PrismaClient } = require('../src/generated/prisma')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = 'jean.maringa@hotmail.com'

    // Check if admin exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    })

    if (!existingUser) {
        const password = 'academy@123'
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                name: 'Jean Maringa',
                password: hashedPassword,
                role: 'ADMIN',
                status: 'ACTIVE'
            },
        })
        console.log('Admin user created:', user)
    } else {
        console.log('Admin user already exists')
    }
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
