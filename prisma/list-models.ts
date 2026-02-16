import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    console.log("Modelos disponíveis no Prisma:")
    console.log(Object.keys(prisma).filter(k => !k.startsWith('$')).join(', '))

    await prisma.$disconnect()
    await pool.end()
}

main().catch(console.error)
