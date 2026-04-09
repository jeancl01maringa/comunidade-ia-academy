import { prisma } from "@/lib/prisma"
import { ImageCard } from "@/components/gallery/image-card"
import { CategoryFilter } from "@/components/gallery/category-filter"
import { GallerySort } from "@/components/gallery/gallery-sort"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteLogo } from "@/components/ui/site-logo"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

interface HomeProps {
  searchParams: Promise<{ category?: string; page?: string; q?: string; sort?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const params = await searchParams
  const categoryId = params.category
  const searchQuery = params.q
  const sort = params.sort || "recent"
  const currentPage = Number(params.page) || 1
  const pageSize = 40
  const limit = currentPage * pageSize

  // Build Prisma where clause
  const where: any = { visible: true }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (searchQuery) {
    where.title = { contains: searchQuery, mode: 'insensitive' }
  }

  // Build Prisma orderBy clause
  let orderBy: any = { createdAt: "desc" }
  if (sort === "trending") {
    orderBy = { views: "desc" }
  } else if (sort === "old") {
    orderBy = { createdAt: "asc" }
  }

  const [images, totalImages] = await Promise.all([
    prisma.image.findMany({
      where,
      take: limit,
      orderBy,
      include: {
        category: true,
        aiModel: true,
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: { likes: true, saves: true }
        }
      },
    }),
    prisma.image.count({ where })
  ])

  const hasMore = totalImages > images.length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar logoArea={<SiteLogo />} />
      <main className="flex-1 w-full px-4 md:px-10 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-medium tracking-tight text-foreground/90">Galeria da Comunidade</h1>
                <Badge variant="secondary" className="font-normal text-[10px] h-5">
                  {totalImages} Prompts
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Explore imagens incríveis geradas por IA e seus prompts originais.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <GallerySort />
            </div>
          </div>

          <CategoryFilter categories={categories} />

          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
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

          {hasMore && (
            <div className="flex justify-center py-10">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent transition-all duration-300"
                asChild
              >
                <Link
                  href="/biblioteca"
                >
                  Ver mais arquivos
                </Link>
              </Button>
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
              Nenhuma imagem encontrada nesta categoria.
            </div>
          )}
        </div>
      </main>
      <footer className="py-10 border-t border-border/10">
        <div className="container px-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} IAACADEMY. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
