"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Settings2 } from "lucide-react"
import { updateIntegration } from "./actions"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface IntegrationCardProps {
    gateway: {
        id: string
        name: string
        description: string
        icon: string
    }
    data?: {
        apiKey?: string | null
        webhookSecret?: string | null
        isActive: boolean
    }
}

export function IntegrationCard({ gateway, data }: IntegrationCardProps) {
    const [copied, setCopied] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isActive, setIsActive] = useState(data?.isActive ?? false)
    const [apiKey, setApiKey] = useState(data?.apiKey ?? "")
    const [webhookSecret, setWebhookSecret] = useState(data?.webhookSecret ?? "")
    const [isLoading, setIsLoading] = useState(false)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
    const webhookUrl = `${baseUrl}/api/payments/webhooks/${gateway.id.toLowerCase()}`

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async (activeState = isActive) => {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("gateway", gateway.id)
        formData.append("apiKey", apiKey)
        formData.append("webhookSecret", webhookSecret)
        formData.append("isActive", activeState.toString())

        const result = await updateIntegration(formData)
        setIsLoading(false)

        if (result.success) {
            toast.success(`${gateway.name} atualizado com sucesso!`)
            setIsEditing(false)
        } else {
            toast.error(result.error || "Erro ao atualizar")
        }
    }

    const handleToggleActive = async (checked: boolean) => {
        setIsActive(checked)
        await handleSave(checked)
    }

    return (
        <div className="bg-card border border-border/50 rounded-3xl overflow-hidden transition-all hover:border-border p-6 flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-xl shadow-inner border border-border/10">
                        {gateway.icon}
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">{gateway.name}</h3>
                        <p className="text-xs text-muted-foreground">{gateway.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className={isActive ? "bg-green-500/10 text-green-500 border-none" : "bg-muted text-muted-foreground opacity-50 border-none"}
                    >
                        {isActive ? "Configurado" : "Inativo"}
                    </Badge>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">URL do Webhook</Label>
                    <div className="flex gap-2">
                        <div className="flex-1 h-10 bg-muted/30 border border-border/50 rounded-xl px-4 flex items-center text-xs text-muted-foreground overflow-hidden whitespace-nowrap overflow-ellipsis">
                            {webhookUrl}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 rounded-xl bg-card border-border/50"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">API Key / Token</Label>
                            <Input
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Insira a chave da plataforma"
                                className="h-10 rounded-xl bg-muted/30 border-border/50 focus:ring-1 focus:ring-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">App Secret / Webhook Hash</Label>
                            <Input
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                placeholder="Segredo para validação de segurança"
                                className="h-10 rounded-xl bg-muted/30 border-border/50 focus:ring-1 focus:ring-foreground"
                                type="password"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={() => handleSave()}
                                className="flex-1 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? "Salvando..." : "Salvar Configurações"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="h-10 rounded-xl border-border/50 font-medium"
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={isActive}
                                onCheckedChange={handleToggleActive}
                                className="data-[state=checked]:bg-green-500"
                            />
                            <Label className="text-xs text-muted-foreground cursor-pointer" onClick={() => handleToggleActive(!isActive)}>
                                {isActive ? "Ativado" : "Desivado"}
                            </Label>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground h-8 rounded-lg gap-1.5"
                            onClick={() => setIsEditing(true)}
                        >
                            <Settings2 className="h-3.5 w-3.5" /> Editar
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
