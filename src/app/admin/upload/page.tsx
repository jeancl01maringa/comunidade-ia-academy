import { prisma } from "@/lib/prisma"
import { UploadDialog } from "./upload-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { VisibilitySwitch, DeleteButton } from "./upload-actions-client"
import { AdminPagination } from "./pagination"

export const dynamic = "force-dynamic"

interface PageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function UploadsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const pageSize = 10

    const [images, totalImages] = await Promise.all([
        prisma.image.findMany({
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                aiModel: true,
            }
        }),
        prisma.image.count()
    ])

    const totalPages = Math.ceil(totalImages / pageSize)

    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
    const aiModels = await prisma.aIModel.findMany({ orderBy: { name: "asc" } })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-medium">Gerenciar Uploads</h1>
                    <Badge variant="secondary" className="font-normal">
                        {totalImages} total
                    </Badge>
                </div>
                <UploadDialog
                    categories={categories.map(c => ({ id: c.id, name: c.name }))}
                    aiModels={aiModels.map(m => ({ id: m.id, name: m.name }))}
                />
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>ID / Título</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Modelo IA</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Visível</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {images.map((image) => (
                            <TableRow key={image.id}>
                                <TableCell>
                                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                                        <img
                                            src={image.url}
                                            alt={image.title || "Image"}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm truncate max-w-[200px]">
                                            {image.title || "Sem título"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            #{image.id.slice(-6)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{image.category.name}</Badge>
                                </TableCell>
                                <TableCell>
                                    {image.aiModel ? (
                                        <span className="text-sm">{image.aiModel.name}</span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge className={image.status === "APPROVED" ? "bg-green-600/20 text-green-500 border-green-500/20" : "bg-yellow-600/20 text-yellow-500 border-yellow-500/20"}>
                                        {image.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <VisibilitySwitch id={image.id} initialVisible={image.visible} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(image.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteButton id={image.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {images.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    Nenhum upload encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/upload"
            />
        </div>
    )
}
