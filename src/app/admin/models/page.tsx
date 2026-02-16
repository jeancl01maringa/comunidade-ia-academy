import { prisma } from "@/lib/prisma"
import { ModelForm } from "./model-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteModelButton } from "./model-actions"

export const dynamic = "force-dynamic"

export default async function ModelsPage() {
    const models = await prisma.aIModel.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { images: true } } }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-lg font-medium">Gerenciar Modelos de IA</h1>

            <ModelForm />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {models.map((model) => (
                    <Card key={model.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-medium">{model.name}</CardTitle>
                            <DeleteModelButton id={model.id} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground">
                                {model._count.images} imagens utilizando este modelo
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
