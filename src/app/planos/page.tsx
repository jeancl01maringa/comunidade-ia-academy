import { Navbar } from "@/components/layout/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const mainPlan = {
    name: "Plano Anual",
    originalPrice: "R$ 147,00",
    price: "R$ 47,00",
    interval: "/ano",
    savings: "65%",
    features: [
        "Acesso a todos os modelos",
        "Downloads ilimitados",
        "Acesso a todas categorias",
        "Atualizações Semanais",
        "Vídeo Aulas",
        "Suporte Exclusivo",
        "Desconto de 30% em relação ao plano mensal"
    ]
}

const tiers = [
    {
        name: "PREMIUM LITE",
        price: "R$ 34,90",
        downloads: "Até 5 downloads por dia",
        icon: "⚡",
        features: [
            "Acesso ao Academy",
            "Qualquer arquivo do site",
            "Downloads simultâneos",
            "Velocidade máxima",
            "Site sem anúncios",
            "Atualizações diárias",
            "Liberação imediata"
        ]
    },
    {
        name: "PREMIUM PRO",
        price: "R$ 49,90",
        downloads: "Até 10 downloads por dia",
        icon: "👑",
        features: [
            "Acesso ao Academy",
            "Qualquer arquivo do site",
            "Downloads simultâneos",
            "Velocidade máxima",
            "Site sem anúncios",
            "Atualizações diárias",
            "Liberação imediata"
        ],
        isPopular: true
    },
    {
        name: "PREMIUM PLUS",
        price: "R$ 89,90",
        downloads: "Até 20 downloads por dia",
        icon: "💎",
        features: [
            "Acesso ao Academy",
            "Qualquer arquivo do site",
            "Downloads simultâneos",
            "Velocidade máxima",
            "Site sem anúncios",
            "Atualizações diárias",
            "Liberação imediata"
        ]
    }
]

export default function PlanosPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-6 pb-24">
                {/* Hero Section */}
                <section className="pt-32 pb-16 flex flex-col items-center text-center">
                    <Badge variant="secondary" className="mb-6 py-1 px-4 bg-muted/40 text-muted-foreground border-none font-normal text-[10px] uppercase tracking-widest rounded-full">
                        ✨ Escolha o plano ideal para você
                    </Badge>

                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                        Junte-se ao <span className="text-gold">premium</span>
                    </h1>

                    <p className="text-muted-foreground text-sm max-w-xl leading-relaxed mb-12">
                        Templates profissionais para seu negócio. Comece grátis ou escolha um plano premium.
                    </p>

                    {/* Main Featured Plan */}
                    <div className="relative w-full max-w-sm">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-t border-white/20 px-4 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-lg shadow-blue-500/20">
                                Mais Popular
                            </Badge>
                        </div>

                        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
                            <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <span className="text-xl">⭐</span>
                            </div>

                            <h2 className="text-xl font-medium mb-1">{mainPlan.name}</h2>
                            <p className="text-muted-foreground text-[10px] line-through mb-1 uppercase tracking-widest">De {mainPlan.originalPrice}</p>

                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl font-bold font-mono tracking-tighter">{mainPlan.price}</span>
                                <span className="text-muted-foreground text-xs">{mainPlan.interval}</span>
                            </div>

                            <Badge className="bg-green-500/10 text-green-500 border-none mb-8 px-3 py-1 text-[10px] font-bold">
                                Economize {mainPlan.savings}
                            </Badge>

                            <div className="w-full space-y-3 mb-8">
                                {mainPlan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs text-foreground/80">
                                        <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                            <Check className="h-2.5 w-2.5 text-green-500" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 w-full">
                                <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 text-white border-0 py-6 text-lg">
                                    Assinar Agora
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tiers Section */}
                <section className="mt-24 pt-24 border-t border-border/5">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-medium mb-4">Por que escolher nossos planos?</h2>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest">Benefícios exclusivos para todos os nossos clientes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier, i) => (
                            <div key={i} className={cn(
                                "group bg-card/20 backdrop-blur-xl border border-white/5 rounded-2xl p-8 transition-all hover:bg-card/30 hover:border-white/10",
                                tier.isPopular && "ring-1 ring-blue-500/20 border-blue-500/20"
                            )}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center text-xl border border-white/5">
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-blue-500 font-medium text-[10px] uppercase tracking-[0.2em]">{tier.name}</h3>
                                </div>

                                <div className="mb-2">
                                    <span className="text-3xl font-bold font-mono tracking-tighter">{tier.price}</span>
                                    <span className="text-muted-foreground text-[10px] ml-1 uppercase tracking-widest">/mês</span>
                                </div>
                                <p className="text-muted-foreground text-xs mb-8">{tier.downloads}</p>

                                <div className="space-y-4 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs text-foreground/70">
                                            <div className="h-4 w-4 rounded-full bg-blue-500/5 flex items-center justify-center shrink-0">
                                                <Check className="h-2.5 w-2.5 text-blue-500/50" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button variant="outline" className="w-full h-11 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 font-normal text-muted-foreground group-hover:text-foreground transition-all text-xs">
                                    Cadastre-se
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
