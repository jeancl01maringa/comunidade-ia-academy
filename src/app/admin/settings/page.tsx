import { prisma } from "@/lib/prisma"
import { SettingsLogoForm } from "./settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: "site_logo" }
    })

    const currentLogo = setting?.value || null

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
                    <SettingsLogoForm currentLogo={currentLogo} />
                </div>
            </div>
        </div>
    )
}
