import { getIntegrations } from "./actions"
import { IntegrationCard } from "./integration-card"
import { Badge } from "@/components/ui/badge"

export default async function IntegracoesPage() {
    const integrationsList = await getIntegrations()

    const gateways = [
        {
            id: "HOTMART",
            name: "Hotmart",
            description: "Integração via webhook para vendas Hotmart",
            icon: "🔥"
        },
        {
            id: "KIWIFY",
            name: "Kiwify",
            description: "Integração via webhook para vendas Kiwify",
            icon: "🥝"
        },
        {
            id: "GREEN",
            name: "Green",
            description: "Integração via webhook para vendas Green",
            icon: "🌿"
        }
    ]

    return (
        <div className="flex flex-col gap-8 p-10">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-medium tracking-tight text-foreground/90">Painel de Integrações</h1>
                    <Badge variant="secondary" className="bg-foreground/5 text-muted-foreground border-none px-2 h-5 text-[10px]">
                        Webhooks & APIs
                    </Badge>
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Configure as integrações com plataformas de pagamento para liberar acessos automaticamente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gateways.map((gateway) => {
                    const data = integrationsList.find(i => i.gateway === gateway.id)
                    return (
                        <IntegrationCard
                            key={gateway.id}
                            gateway={gateway}
                            data={data}
                        />
                    )
                })}
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 mt-4">
                <h2 className="text-base font-medium mb-4">Como configurar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] shrink-0">1</div>
                            <div>
                                <p className="text-sm font-medium mb-1">Copie a URL do webhook</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Clique no botão de copiar ao lado da URL do webhook da plataforma desejada.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] shrink-0">2</div>
                            <div>
                                <p className="text-sm font-medium mb-1">Configure na plataforma</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Acesse as configurações de webhook/API na Hotmart, Kiwify ou Green e cole a URL copiada.</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] shrink-0">3</div>
                            <div>
                                <p className="text-sm font-medium mb-1">Selecione os eventos</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Marque os eventos recomendados (Venda Aprovada, Reembolso) para que o sistema receba as notificações.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] shrink-0">4</div>
                            <div>
                                <p className="text-sm font-medium mb-1">Vincule os produtos</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">Certifique-se de que o ID do produto na plataforma externa corresponde aos acessos da comunidade.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
