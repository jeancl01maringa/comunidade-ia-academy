import { prisma } from "@/lib/prisma"
import { CategoryForm } from "./category-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteCategoryButton } from "./category-actions"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { images: true } } }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-lg font-medium">Gerenciar Categorias</h1>

            <div className="border p-4 rounded-lg bg-card">
                <CategoryForm />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                    <Card key={cat.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-medium capitalize">{cat.name}</CardTitle>
                            <DeleteCategoryButton id={cat.id} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {cat._count.images} imagens
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
