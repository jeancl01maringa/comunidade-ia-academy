import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { SiteLogo } from "@/components/ui/site-logo"
import { Search, ExternalLink, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

interface DesignPageProps {
    searchParams: Promise<{ q?: string; category?: string }>
}

export default async function DesignPage({ searchParams }: DesignPageProps) {
    const params = await searchParams
    const q = params.q?.trim() || ""
    const categoryId = params.category || ""

    const [tools, toolCategories] = await Promise.all([
        prisma.tool.findMany({
            where: {
                isActive: true,
                ...(categoryId ? { categoryId } : {}),
                ...(q ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { description: { contains: q, mode: "insensitive" } },
                    ]
                } : {}),
            },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.toolCategory.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
            include: { _count: { select: { tools: { where: { isActive: true } } } } }
        })
    ])

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar logoArea={<SiteLogo />} />
            <main className="flex-1 w-full px-4 md:px-8 py-10 max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-medium tracking-tight text-foreground/90">Ferramentas IA</h1>
                            <Badge variant="secondary" className="font-normal text-[10px] h-5">
                                {tools.length} ferramentas
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Explore ferramentas de IA selecionadas para turbinar seus projetos criativos.
                        </p>
                    </div>

                    {/* Search + Category filter */}
                    <form method="GET" className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder="Buscar ferramentas..."
                                className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <select
                            name="category"
                            defaultValue={categoryId}
                            className="h-10 rounded-xl border border-border bg-card/50 backdrop-blur-sm px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                        >
                            <option value="">Todas as categorias</option>
                            {toolCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:scale-[1.02] transition-all shadow-lg shadow-blue-900/30"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Tools Grid */}
                    {tools.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
                            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhuma ferramenta encontrada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tools.map(tool => (
                                <div
                                    key={tool.id}
                                    className="group flex flex-col rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300"
                                >
                                    {/* Top */}
                                    <div className="flex items-start gap-3 p-4">
                                        {/* Logo / Avatar */}
                                        <div className="h-11 w-11 rounded-xl bg-muted/50 border border-border/50 overflow-hidden flex items-center justify-center shrink-0">
                                            {tool.imageUrl ? (
                                                <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Sparkles className="h-5 w-5 text-blue-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-foreground text-sm leading-tight truncate">{tool.name}</p>
                                                {tool.isNew && (
                                                    <span className="text-[9px] uppercase tracking-widest font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 leading-none">
                                                        Novo
                                                    </span>
                                                )}
                                            </div>
                                            {tool.category && (
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                                                    {tool.category.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {tool.description && (
                                        <div className="px-4 pb-3">
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {tool.description}
                                            </p>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="mt-auto p-4 pt-2">
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-blue-900/30"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Acessar Ferramenta
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Categories Section */}
                    {toolCategories.length > 0 && (
                        <div className="space-y-4 pt-4 border-t border-border/30">
                            <h2 className="text-sm font-medium text-foreground/70 uppercase tracking-widest">Categorias</h2>
                            <div className="flex flex-wrap gap-3">
                                {toolCategories.map(cat => (
                                    <a
                                        key={cat.id}
                                        href={`/design?category=${cat.id}`}
                                        className={`px-4 py-2 rounded-xl border text-sm transition-all hover:border-blue-500/50 hover:text-foreground ${categoryId === cat.id
                                            ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                                            : "border-border bg-card/40 text-muted-foreground"
                                            }`}
                                    >
                                        {cat.name}
                                        <span className="ml-2 text-xs text-muted-foreground/60">{cat._count.tools}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer className="py-10 border-t border-border/10">
                <div className="container px-10">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} IAACADEMY. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    )
}
