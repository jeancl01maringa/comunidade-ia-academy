const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

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
