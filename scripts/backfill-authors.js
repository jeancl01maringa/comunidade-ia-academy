const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found to assign images to.');
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    const imagesCount = await prisma.image.count();
    console.log(`Found ${imagesCount} images total.`);

    const updatedImages = await prisma.image.updateMany({
        data: {
            userId: user.id
        }
    });

    console.log(`Updated ${updatedImages.count} images with userId ${user.id}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
