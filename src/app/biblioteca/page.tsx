import { prisma } from "@/lib/prisma"
import { ImageCard } from "@/components/gallery/image-card"
import { LibraryFilter } from "@/components/gallery/library-filter"
import { GalleryPagination } from "@/components/gallery/pagination"
import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

interface BibliotecaProps {
    searchParams: Promise<{ category?: string; page?: string; q?: string }>
}

export default async function Biblioteca({ searchParams }: BibliotecaProps) {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    })

    const params = await searchParams
    const categoryId = params.category
    const query = params.q
    const currentPage = Number(params.page) || 1
    const pageSize = 20 // Standard page size for library

    const where: any = {
        visible: true,
        ...(categoryId && { categoryId }),
        ...(query && {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { prompt: { contains: query, mode: 'insensitive' } },
            ]
        })
    }

    const [images, totalImages] = await Promise.all([
        prisma.image.findMany({
            where,
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                aiModel: true,
                user: {
                    select: { id: true, name: true, image: true }
                }
            },
        }),
        prisma.image.count({ where })
    ])

    const totalPages = Math.ceil(totalImages / pageSize)

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full pr-10 pl-0 py-10">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-medium tracking-tight text-foreground/90">Biblioteca de Arquivos</h1>
                            <Badge variant="secondary" className="font-normal text-[10px] h-5 bg-foreground/5 text-muted-foreground border-none px-2">
                                {totalImages} itens encontrados
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            Navegue por toda a nossa coleção de prompts e artes geradas por inteligência artificial.
                        </p>
                    </div>

                    {/* Filters */}
                    <LibraryFilter categories={categories} />

                    {/* Grid */}
                    {images.length > 0 ? (
                        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="mb-4 break-inside-avoid">
                                    <ImageCard
                                        image={{
                                            ...image,
                                            createdAt: image.createdAt.toISOString(),
                                            updatedAt: image.updatedAt.toISOString(),
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-center gap-3 bg-card/30 rounded-[40px] border border-dashed border-border/50">
                            <p className="text-muted-foreground font-medium">Ops! Nenhum arquivo encontrado.</p>
                            <p className="text-xs text-muted-foreground/60">Tente ajustar seus filtros ou busca.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <GalleryPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/biblioteca"
                    />
                </div>
            </main>

            <footer className="py-10 border-t border-border/10">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row px-10">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} IAACADEMY. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    )
}
