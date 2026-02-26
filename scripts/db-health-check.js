const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {
    console.log('🔍 Iniciando verificação de saúde do banco de dados...')

    try {
        console.log('⏳ Tentando conectar ao Supabase...')
        const userCount = await prisma.user.count()
        console.log(`✅ Conexão BEM SUCEDIDA! Total de usuários: ${userCount}`)

        const categories = await prisma.category.findMany({ take: 5 })
        console.log(`✅ Categorias lidas com sucesso: ${categories.length} encontradas.`)

    } catch (error) {
        console.error('❌ ERRO CRÍTICO DE CONEXÃO:')
        console.error(error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
