import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    try {
        const userCount = await prisma.user.count()
        const imageCount = await prisma.image.count()
        const categoryCount = await prisma.category.count()

        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-lg font-medium tracking-tight">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">{userCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Imagens</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">{imageCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">{categoryCount}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    } catch (error) {
        console.error("Dashboard Error:", error)
        return (
            <div className="p-4 text-red-500">
                <h1 className="text-2xl font-medium">Erro no Dashboard</h1>
                <pre className="mt-2 p-2 bg-red-100 rounded text-sm overflow-auto">
                    {String(error)}
                </pre>
            </div>
        )
    }
}
