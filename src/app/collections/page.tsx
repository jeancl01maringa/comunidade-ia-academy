import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { Folder, ImageIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CollectionsPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { images: true } },
            images: {
                where: { visible: true },
                take: 1,
                orderBy: { createdAt: "desc" },
                select: { url: true },
            },
        },
    })

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 w-full pr-10 pl-0 py-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-lg font-medium tracking-tight text-foreground/90">
                            Coleções
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Explore nossas coleções temáticas de prompts e imagens geradas por IA.
                        </p>
                    </div>

                    {categories.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
                            Nenhuma coleção disponível ainda.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/?category=${cat.id}`}
                                    className="group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:scale-[1.02] hover:border-blue-500/40 active:scale-[0.98]"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                                        {cat.images[0] ? (
                                            <img
                                                src={cat.images[0].url}
                                                alt={cat.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Folder className="h-10 w-10 text-muted-foreground/40" />
                                            </div>
                                        )}
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    </div>

                                    {/* Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="font-medium text-white capitalize text-sm leading-tight">
                                            {cat.name}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <ImageIcon className="h-3 w-3 text-white/60" />
                                            <span className="text-[11px] text-white/60">
                                                {cat._count.images} prompts
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
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
