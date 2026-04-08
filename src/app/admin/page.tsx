import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Eye,
    Download,
    Heart,
    Users,
    TrendingUp,
    Image as ImageIcon,
    LayoutDashboard,
    ArrowUpRight
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    try {
        // Essential counts
        const userCount = await prisma.user.count()
        const imageCount = await prisma.image.count()
        const categoryCount = await prisma.category.count()

        // Real-time engagement metrics
        const totals = await prisma.image.aggregate({
            _sum: {
                views: true,
                copyCount: true
            }
        })

        const likesCount = await prisma.like.count()
        const savesCount = await prisma.save.count()

        // Engaged users (who liked or saved)
        const engagedUsersCount = await prisma.user.count({
            where: {
                OR: [
                    { likes: { some: {} } },
                    { saves: { some: {} } }
                ]
            }
        })

        // Top 10 Most viewed arts
        const top10Images = await prisma.image.findMany({
            take: 10,
            orderBy: { views: "desc" },
            include: { category: true }
        })

        // Engagement by category
        const categoriesData = await prisma.category.findMany({
            include: {
                images: {
                    select: {
                        views: true,
                        copyCount: true
                    }
                }
            }
        })

        const categoryMetrics = categoriesData.map(cat => ({
            name: cat.name,
            artCount: cat.images.length,
            views: cat.images.reduce((sum, img) => sum + (img.views || 0), 0),
            copies: cat.images.reduce((sum, img) => sum + (img.copyCount || 0), 0)
        })).sort((a, b) => b.views - a.views)

        return (
            <div className="flex flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Acompanhe o crescimento e o engajamento da comunidade.</p>
                </div>

                <Tabs defaultValue="visao_geral" className="w-full">
                    <TabsList className="bg-muted/50 p-1 mb-6">
                        <TabsTrigger value="visao_geral" className="gap-2 px-6">
                            <LayoutDashboard className="h-4 w-4" /> Visão Geral
                        </TabsTrigger>
                        <TabsTrigger value="desempenho" className="gap-2 px-6">
                            <TrendingUp className="h-4 w-4" /> Desempenho Conteúdos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="visao_geral" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <StatsCard
                                title="Total Usuários"
                                value={userCount}
                                icon={Users}
                                color="blue"
                            />
                            <StatsCard
                                title="Total Imagens"
                                value={imageCount}
                                icon={ImageIcon}
                                color="purple"
                            />
                            <StatsCard
                                title="Categorias"
                                value={categoryCount}
                                icon={LayoutDashboard}
                                color="indigo"
                            />
                            <StatsCard
                                title="Engajados"
                                value={engagedUsersCount}
                                icon={ArrowUpRight}
                                color="green"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="desempenho" className="space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <MetricCard
                                title="Total Visualizações"
                                value={totals._sum.views || 0}
                                icon={Eye}
                                percentage="+12%" // Placeholder
                            />
                            <MetricCard
                                title="Total Downloads"
                                value={totals._sum.copyCount || 0}
                                icon={Download}
                                percentage="+5%"
                            />
                            <MetricCard
                                title="Likes e Salvos"
                                value={likesCount + savesCount}
                                icon={Heart}
                                percentage="+18%"
                            />
                            <MetricCard
                                title="Usuários Engajados"
                                value={engagedUsersCount}
                                icon={Users}
                                percentage="+24%"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Top 10 Table */}
                            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <CardTitle className="text-base font-medium flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Top 10 Artes mais Visualizadas
                                    </CardTitle>
                                </CardHeader>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                                            <TableHead className="w-[300px]">Arte</TableHead>
                                            <TableHead className="text-center">Visualizações</TableHead>
                                            <TableHead className="text-center">Downloads</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {top10Images.map((img) => (
                                            <TableRow key={img.id} className="border-border/50 hover:bg-muted/20">
                                                <TableCell className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm font-medium truncate">{img.title || "Sem título"}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{img.category?.name}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{img.views}</TableCell>
                                                <TableCell className="text-center font-medium">{img.copyCount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Engagement by Collection/Category */}
                            <Card className="border-border bg-card/40 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <CardTitle className="text-base font-medium flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                                        Engajamento por Categoria
                                    </CardTitle>
                                </CardHeader>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 border-border hover:bg-muted/30">
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-center">Artes</TableHead>
                                            <TableHead className="text-center">Visu</TableHead>
                                            <TableHead className="text-center">Down</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categoryMetrics.map((cat) => (
                                            <TableRow key={cat.name} className="border-border/50 hover:bg-muted/20">
                                                <TableCell className="py-4 font-medium">{cat.name}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="border-border/60 bg-muted/20">{cat.artCount}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{cat.views}</TableCell>
                                                <TableCell className="text-center font-medium">{cat.copies}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        )
    } catch (error) {
        console.error("Dashboard Error:", error)
        return (
            <div className="p-8 text-red-500 flex flex-col items-center justify-center min-h-[400px]">
                <ShieldAlert className="h-12 w-12 mb-4" />
                <h1 className="text-xl font-bold">Erro no Dashboard</h1>
                <p className="mt-2 text-muted-foreground max-w-md text-center">
                    Não foi possível carregar os dados. Verifique o console para mais detalhes.
                </p>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm font-mono overflow-auto max-w-full">
                    {String(error)}
                </div>
            </div>
        )
    }
}

function MetricCard({ title, value, icon: Icon, percentage }: any) {
    return (
        <Card className="border-border bg-card/60 backdrop-blur-xl hover:translate-y-[-2px] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/5 text-blue-500">
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tracking-tight">{value.toLocaleString("pt-BR")}</div>
                {percentage && (
                    <p className="text-[10px] text-green-500 font-medium pt-1">
                        {percentage} <span className="text-muted-foreground font-normal">desde o mês passado</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        blue: "text-blue-500 bg-blue-500/10",
        purple: "text-purple-500 bg-purple-500/10",
        indigo: "text-indigo-500 bg-indigo-500/10",
        green: "text-green-500 bg-green-500/10"
    }

    return (
        <Card className="border-border overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${colors[color]}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function ShieldAlert(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
}
