"use client"

import { useState, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Shield, CreditCard, MessageCircle, LogOut, Camera, Loader2, Check, Eye, EyeOff, Heart, Bookmark } from "lucide-react"
import { compressImage } from "@/lib/image-optimization"
import { updateProfile, uploadProfilePhoto, changePassword } from "./actions"
import { toast } from "sonner"
import { ImageCard } from "@/components/gallery/image-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const WHATSAPP_URL = "https://wa.me/5544999419907?text=Ol%C3%A1%2C+preciso+de+ajuda+com+a+comunidade+IA+Academy+Pro."

type Tab = "conta" | "assinatura" | "curtidas" | "salvos" | "seguranca"

interface AccountClientProps {
    user: {
        id: string
        name: string | null
        email: string | null
        image: string | null
    }
    likedImages: any[]
    savedImages: any[]
    subscription: {
        status: string
        startDate: Date
        endDate: Date | null
        plan: {
            name: string
            interval: string
            price: number
        }
    } | null
}

export function AccountClient({ user, subscription, likedImages, savedImages }: AccountClientProps) {
    const { update: updateSession } = useSession()
    const [activeTab, setActiveTab] = useState<Tab>("conta")
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(user.name || "")
    const [avatarUrl, setAvatarUrl] = useState(user.image)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const tabs = [
        { id: "conta" as Tab, label: "Minha Conta", icon: User },
        { id: "assinatura" as Tab, label: "Assinatura", icon: CreditCard },
        { id: "curtidas" as Tab, label: "Curtidas", icon: Heart },
        { id: "salvos" as Tab, label: "Salvos", icon: Bookmark },
        { id: "seguranca" as Tab, label: "Segurança", icon: Shield },
    ]

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const maxSize = 3 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("Imagem muito grande. Máximo: 3MB.")
            return
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Formato inválido. Use JPG ou PNG.")
            return
        }

        setLoading(true)
        try {
            const { base64 } = await compressImage(file, { maxWidth: 400, quality: 0.9 })
            const formData = new FormData()
            formData.set("imageBase64", base64)
            const res = await uploadProfilePhoto(formData)
            if (res.success && res.imageUrl) {
                setAvatarUrl(res.imageUrl)
                await updateSession({ image: res.imageUrl })
                toast.success("Foto atualizada!")
            } else {
                toast.error(res.message || "Erro ao enviar foto.")
            }
        } catch {
            toast.error("Erro ao processar imagem.")
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData()
        formData.set("name", name)
        const res = await updateProfile(formData)
        setLoading(false)
        if (res.success) {
            await updateSession({ name })
            toast.success("Nome atualizado!")
        } else {
            toast.error(res.message || "Erro ao salvar.")
        }
    }

    async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const res = await changePassword(formData)
        setLoading(false)
        if (res.success) {
            toast.success("Senha alterada com sucesso!")
                ; (e.target as HTMLFormElement).reset()
        } else {
            toast.error(res.message || "Erro ao alterar senha.")
        }
    }

    const intervalLabel = subscription?.plan?.interval === "year" ? "Anual" : "Mensal"
    const statusMap: Record<string, { label: string; color: string }> = {
        ACTIVE: { label: "Ativa", color: "text-green-500" },
        EXPIRED: { label: "Expirada", color: "text-red-400" },
        CANCELLED: { label: "Cancelada", color: "text-muted-foreground" },
    }
    const subStatus = subscription ? (statusMap[subscription.status] ?? { label: subscription.status, color: "text-muted-foreground" }) : null

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mx-auto py-10 px-4 md:px-8">
            {/* Sidebar Nav */}
            <nav className="md:w-52 shrink-0 md:max-w-none max-w-full">
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none snap-x snap-mandatory">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left ${activeTab === tab.id
                                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                    }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {tab.label}
                            </button>
                        )
                    })}
                    <div className="hidden md:block h-px bg-border/40 my-2" />
                    <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all whitespace-nowrap"
                    >
                        <MessageCircle className="h-4 w-4 shrink-0 text-green-500" />
                        Suporte
                    </a>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left whitespace-nowrap"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        Sair da Conta
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* ── TAB: MINHA CONTA ── */}
                {activeTab === "conta" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-lg font-medium text-foreground">Minha Conta</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas informações pessoais.</p>
                        </div>

                        {/* Avatar */}
                        <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
                            <p className="text-sm font-medium text-foreground">Foto de Perfil</p>
                            <div className="flex items-center gap-5">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[2px]">
                                        <div className="h-full w-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                                            {loading ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            ) : avatarUrl ? (
                                                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loading}
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                        Alterar Foto
                                    </Button>
                                    <p className="text-xs text-muted-foreground">Formatos: JPG, PNG • Máx: 3MB</p>
                                    <p className="text-xs text-muted-foreground">Recomendado: imagens quadradas</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <form onSubmit={handleSaveName} className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
                            <p className="text-sm font-medium text-foreground">Informações Pessoais</p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">Nome Completo</Label>
                                    <Input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        className="bg-muted/20 border-border"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">Email</Label>
                                    <Input
                                        value={user.email || ""}
                                        readOnly
                                        className="bg-muted/10 border-border text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-2">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── TAB: ASSINATURA ── */}
                {activeTab === "assinatura" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-lg font-medium text-foreground">Assinatura</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Detalhes do seu plano atual.</p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card/50 p-6">
                            {subscription ? (
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Plano</p>
                                            <p className="text-xl font-semibold text-foreground">{subscription.plan.name}</p>
                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                {intervalLabel}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Valor</p>
                                            <p className="text-xl font-semibold text-foreground">
                                                R$ {subscription.plan.price.toFixed(2).replace(".", ",")}
                                                <span className="text-sm text-muted-foreground font-normal">/{subscription.plan.interval === "year" ? "ano" : "mês"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                                            <p className={`text-sm font-medium flex items-center gap-1.5 ${subStatus?.color}`}>
                                                <span className={`h-2 w-2 rounded-full ${subscription.status === "ACTIVE" ? "bg-green-500" : "bg-red-400"}`} />
                                                {subStatus?.label}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Data de Compra</p>
                                            <p className="text-sm text-foreground">
                                                {new Date(subscription.startDate).toLocaleDateString("pt-BR")}
                                            </p>
                                        </div>
                                        {subscription.endDate && (
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Vencimento</p>
                                                <p className="text-sm text-foreground">
                                                    {new Date(subscription.endDate).toLocaleDateString("pt-BR")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                                    <p className="text-muted-foreground text-sm">Você não possui uma assinatura ativa.</p>
                                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white" asChild>
                                        <a href="/planos">Ver Planos</a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: CURTIDAS ── */}
                {activeTab === "curtidas" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-lg font-medium text-foreground">Minhas Curtidas</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Artes que você curtiu recentemente.</p>
                        </div>

                        {likedImages.length > 0 ? (
                            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                {likedImages.map((img) => (
                                    <ImageCard key={img.id} image={img} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                                <Heart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground text-sm">Você ainda não curtiu nenhuma arte.</p>
                                <Button variant="link" className="text-blue-500" asChild>
                                    <a href="/">Explorar Galeria</a>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: SALVOS ── */}
                {activeTab === "salvos" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-lg font-medium text-foreground">Itens Salvos</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Sua coleção pessoal de prompts salvos.</p>
                        </div>

                        {savedImages.length > 0 ? (
                            <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                {savedImages.map((img) => (
                                    <ImageCard key={img.id} image={img} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                                <Bookmark className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-muted-foreground text-sm">Sua coleção está vazia.</p>
                                <Button variant="link" className="text-blue-500" asChild>
                                    <a href="/">Explorar Galeria</a>
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: SEGURANÇA ── */}
                {activeTab === "seguranca" && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-lg font-medium text-foreground">Segurança</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Mantenha sua conta segura com uma senha forte.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="rounded-2xl border border-border bg-card/50 p-6 space-y-4">
                            <p className="text-sm font-medium text-foreground">Alterar Senha</p>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">Senha Atual</Label>
                                    <div className="relative">
                                        <Input name="currentPassword" type={showCurrent ? "text" : "password"} placeholder="••••••••" required className="bg-muted/20 border-border pr-10" />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">Nova Senha</Label>
                                    <div className="relative">
                                        <Input name="newPassword" type={showNew ? "text" : "password"} placeholder="••••••••" required className="bg-muted/20 border-border pr-10" />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-widest">Confirmar Nova Senha</Label>
                                    <div className="relative">
                                        <Input name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" required className="bg-muted/20 border-border pr-10" />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-2">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Alterar Senha
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
