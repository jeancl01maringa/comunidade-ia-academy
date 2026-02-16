const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debug() {
    console.log('--- PRISMA MODELS DETECTED ---')
    const models = Object.keys(prisma).filter(k => k[0] !== '_' && k[0] !== '$')
    console.log('Available models:', models.join(', '))

    if (models.includes('integration')) {
        console.log('✅ Integration model found')
    } else {
        console.log('❌ Integration model NOT found')
    }

    if (models.includes('payment')) {
        console.log('✅ Payment model found')
    } else {
        console.log('❌ Payment model NOT found')
    }

    try {
        const userFields = Object.keys(prisma.user.fields || {})
        console.log('User fields:', userFields.join(', '))
    } catch (e) {
        console.log('Could not introspect User fields directly')
    }
}

debug().finally(() => prisma.$disconnect())
