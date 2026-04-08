import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { NewToolDialog } from "./tool-dialog"
import { ToolCategoryDialog } from "./category-dialog"
import { DeleteToolButton } from "./tool-actions-client"
import { ExternalLink, Sparkles, Tag } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminToolsPage() {
    const [tools, categories] = await Promise.all([
        prisma.tool.findMany({
            orderBy: { createdAt: "desc" },
            include: { category: true }
        }),
        prisma.toolCategory.findMany({
            orderBy: { name: "asc" },
            include: { _count: { select: { tools: true } } }
        })
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-medium">Gerenciar Ferramentas IA</h1>
                    <Badge variant="secondary" className="font-normal">{tools.length} total</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <ToolCategoryDialog categories={categories} />
                    <NewToolDialog categories={categories.map(c => ({ id: c.id, name: c.name }))} />
                </div>
            </div>

            {/* Tools Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px] gap-4 px-5 py-3 border-b border-border/60 bg-muted/20">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Ferramenta</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Categoria</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-center">Novo</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">URL</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-right">Ações</span>
                </div>

                {tools.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Nenhuma ferramenta cadastrada.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {tools.map(tool => (
                            <div key={tool.id} className="grid grid-cols-[2fr_1fr_1fr_80px_80px_80px] gap-4 px-5 py-3 items-center hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-muted/50 border border-border/40 overflow-hidden flex items-center justify-center shrink-0">
                                        {tool.imageUrl ? (
                                            <img src={tool.imageUrl} alt={tool.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Sparkles className="h-4 w-4 text-blue-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">{tool.name}</p>
                                        {tool.description && (
                                            <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {tool.category ? (
                                        <Badge variant="secondary" className="text-[10px]">{tool.category.name}</Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </div>
                                <div>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tool.isActive ? "text-green-500" : "text-muted-foreground"}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${tool.isActive ? "bg-green-500" : "bg-muted-foreground"}`} />
                                        {tool.isActive ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <div className="text-center">
                                    {tool.isNew && (
                                        <Badge className="text-[9px] bg-blue-500/15 text-blue-400 border-blue-500/20">Novo</Badge>
                                    )}
                                </div>
                                <div>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-400 transition-colors">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                                <div className="flex justify-end">
                                    <DeleteToolButton id={tool.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Categories preview */}
            {categories.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-medium">Categorias</h2>
                        <Badge variant="secondary" className="font-normal text-xs">{categories.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-xs">
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-muted-foreground ml-1.5">({cat._count.tools})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
