import { prisma } from "@/lib/prisma"
import { SettingsLogoForm } from "./settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ["site_logo_dark", "site_logo_light", "site_logo"] } }
    })

    const currentLogoDark = settings.find(s => s.key === "site_logo_dark")?.value || settings.find(s => s.key === "site_logo")?.value || null
    const currentLogoLight = settings.find(s => s.key === "site_logo_light")?.value || settings.find(s => s.key === "site_logo")?.value || null

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Personalizar</h1>
                <p className="text-muted-foreground">
                    Gerencie a identidade visual e as configurações globais da plataforma.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <SettingsLogoForm
                        title="Logo (Modo Escuro)"
                        description="Este logo aparecerá quando o usuário estiver usando o Tema Escuro. Recomendamos logos com tipografia clara ou branca para garantir contraste perfeito no fundo escuro."
                        settingKey="site_logo_dark"
                        currentLogo={currentLogoDark}
                    />
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <SettingsLogoForm
                        title="Logo (Modo Claro)"
                        description="Este logo aparecerá quando o usuário estiver usando o Tema Claro. Recomendamos logos coloridos ou pretos para garantir alto contraste nos fundos de tela brancos."
                        settingKey="site_logo_light"
                        currentLogo={currentLogoLight}
                    />
                </div>
            </div>
        </div>
    )
}
