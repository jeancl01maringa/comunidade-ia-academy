"use client"

import { Image as ImageType, Category, User, AIModel } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Copy, Download, Check, Maximize2, ShieldAlert, Bug, Cpu, Lock, Heart, Bookmark, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEngagement } from "@/hooks/use-engagement"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Define a type that matches the serialized image
type SerializedImage = Omit<ImageType, "createdAt" | "updatedAt" | "supportImages"> & {
    createdAt: string | Date
    updatedAt: string | Date
    supportImages?: string[]
    instructions?: string | null
    category?: Category | null
    aiModel?: AIModel | null
    user?: Pick<User, "id" | "name" | "image"> | null
    views?: number
    copyCount?: number
    _count?: {
        likes: number
        saves: number
    }
}

export function ImageCard({ image }: { image: SerializedImage }) {
    const { data: session } = useSession()
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [activeImageIndex, setActiveImageIndex] = useState(-1) // -1 is main image, 0-3 are support images

    const {
        likes,
        saves,
        isLiking,
        isSaving,
        trackView,
        trackCopy,
        toggleLike,
        toggleSave
    } = useEngagement(image.id, image._count?.likes || 0, image._count?.saves || 0)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const userRole = session?.user?.role || "USER"
    const hasElevatedRole = userRole !== "USER"

    // Explicit Subscription valid check (for normal "USER" base accounts)
    const isPremiumSubscriber = userRole === "USER" &&
        session?.user?.status === "ACTIVE" &&
        session?.user?.expiresAt &&
        new Date(session.user.expiresAt) > new Date()

    const isPremium = hasElevatedRole || isPremiumSubscriber

    const isLocked = !isPremium

    const handleCopy = () => {
        if (isLocked) {
            router.push("/planos")
            return
        }
        navigator.clipboard.writeText(image.prompt)
        setCopied(true)
        trackCopy()
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        if (isLocked) {
            router.push("/planos")
            return
        }

        let targetUrl = image.url
        let targetName = `image-${image.id}.png`

        if (activeImageIndex !== -1 && image.supportImages && image.supportImages[activeImageIndex]) {
            targetUrl = image.supportImages[activeImageIndex]
            targetName = `image-${image.id}-support-${activeImageIndex}.png`
        }

        const link = document.createElement("a")
        link.href = targetUrl
        link.download = targetName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleOpenChange = (open: boolean) => {
        if (open) {
            if (isLocked) {
                router.push("/planos")
                return
            }
            trackView()
        }
    }

    const isLongPrompt = image.prompt.length > 150

    if (!isMounted) return null

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <div className="group relative break-inside-avoid overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg">
                <DialogTrigger asChild>
                    <div className="relative w-full overflow-hidden cursor-pointer">
                        <img
                            src={image.url}
                            alt={image.title || image.prompt}
                            className={cn(
                                "w-full h-auto object-cover transition-all duration-300 group-hover:scale-105",
                                isLocked && "grayscale blur-sm opacity-60"
                            )}
                            loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                            {isLocked && (
                                <div className="bg-background/80 backdrop-blur-md p-3 rounded-full shadow-2xl border border-white/20 scale-90 group-hover:scale-100 transition-transform">
                                    <Lock className="h-6 w-6 text-foreground" />
                                </div>
                            )}
                        </div>
                    </div>
                </DialogTrigger>
            </div>

            <DialogContent className="sm:max-w-none md:w-[960px] w-[calc(100%-2rem)] max-w-full h-fit max-h-[90vh] md:max-h-[650px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border shadow-2xl ring-1 ring-border transition-all">
                <div className="flex flex-col md:flex-row h-auto min-h-0 md:h-full max-h-[90vh] md:max-h-[650px] overflow-hidden">
                    {/* Left side: Image and Thumbnails */}
                    <div className="w-full md:w-[48%] bg-muted/20 flex flex-col relative h-full min-h-[300px] border-b md:border-b-0 md:border-r border-border p-4 md:p-5">

                        {/* Main Viewer Area */}
                        <div className="flex-1 flex items-center justify-center w-full mb-4 overflow-hidden">
                            <img
                                src={activeImageIndex === -1 ? image.url : (image.supportImages?.[activeImageIndex] || image.url)}
                                alt={image.title || image.prompt}
                                className="w-full h-full object-contain max-h-[35vh] md:max-h-[500px] rounded-xl shadow-2xl transition-all duration-300"
                            />
                        </div>

                        {/* Composition Thumbnails Strip */}
                        {image.supportImages && image.supportImages.length > 0 && (
                            <div className="flex items-center justify-start gap-2 md:gap-3 w-full self-end shrink-0 overflow-x-auto pb-1 scrollbar-none">
                                <button
                                    onClick={() => setActiveImageIndex(-1)}
                                    className={cn(
                                        "h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200",
                                        activeImageIndex === -1 ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105 z-10" : "border-border/50 hover:border-border cursor-pointer opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <img src={image.url} className="w-full h-full object-cover" />
                                </button>

                                {image.supportImages.map((supUrl, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                            "h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200",
                                            activeImageIndex === idx ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-105 z-10" : "border-border/50 hover:border-border cursor-pointer opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={supUrl} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right side: Information */}
                    <div className="w-full md:w-[52%] flex flex-col h-full bg-background relative">
                        {/* Scrollable Main Content */}
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto md:scrollbar-dark">
                            <div className="space-y-4 md:space-y-6">
                                {/* Tags Row: Category + AI Model */}
                                <div className="flex flex-wrap gap-2">
                                    {image.category && (
                                        <Badge variant="secondary" className="bg-muted/40 text-muted-foreground border-none uppercase text-[10px] tracking-widest px-2 py-0.5 pointer-events-none w-fit">
                                            {image.category.name}
                                        </Badge>
                                    )}
                                    {image.aiModel && (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none uppercase text-[10px] tracking-widest px-2 py-0.5 pointer-events-none w-fit flex gap-1 items-center">
                                            <Cpu className="h-3 w-3" /> {image.aiModel.name}
                                        </Badge>
                                    )}
                                </div>

                                {/* Título */}
                                <div className="space-y-1">
                                    <DialogHeader>
                                        <DialogTitle className="text-base md:text-lg font-medium text-foreground leading-tight">
                                            {image.title || "Imagem Gerada por IA"}
                                        </DialogTitle>
                                    </DialogHeader>
                                    {/* Action Buttons: Like & Save */}
                                    <div className="flex items-center gap-2 pt-1 border-b border-border/50 pb-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleLike}
                                            disabled={isLiking}
                                            className={cn(
                                                "h-9 rounded-full px-4 gap-2 border-border/60 hover:bg-muted/40",
                                                likes > 0 && "text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                                            )}
                                        >
                                            <Heart className={cn("h-4 w-4", likes > 0 && "fill-current")} />
                                            <span className="text-xs">{likes}</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={toggleSave}
                                            disabled={isSaving}
                                            className={cn(
                                                "h-9 rounded-full px-4 gap-2 border-border/60 hover:bg-muted/40",
                                                saves > 0 && "text-blue-500 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10"
                                            )}
                                        >
                                            <Bookmark className={cn("h-4 w-4", saves > 0 && "fill-current")} />
                                            <span className="text-xs">{saves}</span>
                                        </Button>

                                        <div className="flex-1" />

                                        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                                            <ShieldAlert className="h-3 w-3" /> Denunciar
                                        </button>
                                        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                                            <Bug className="h-3 w-3" /> Bug
                                        </button>
                                    </div>
                                </div>

                                {/* Prompt Section */}
                                <div className="space-y-2 md:space-y-3">
                                    <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Prompt original</p>
                                    <div className="space-y-4">
                                        <div className="text-sm text-foreground/90 leading-relaxed font-light bg-muted/20 p-3 md:p-4 rounded-xl border border-border">
                                            {isLongPrompt && !expanded ? (
                                                <div>
                                                    <p className="break-words text-xs md:text-sm">{image.prompt.slice(0, 100)}...</p>
                                                    <button
                                                        onClick={() => setExpanded(true)}
                                                        className="text-blue-500 hover:text-blue-400 text-[10px] md:text-sm font-medium mt-2 focus:outline-none flex items-center gap-1"
                                                    >
                                                        Veja mais <Maximize2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 md:space-y-3">
                                                    <p className={`break-words text-xs md:text-sm ${isLongPrompt ? "max-h-[100px] md:max-h-[150px] overflow-y-auto pr-2 scrollbar-dark" : ""}`}>
                                                        {image.prompt}
                                                    </p>
                                                    {isLongPrompt && (
                                                        <button
                                                            onClick={() => setExpanded(false)}
                                                            className="text-blue-500 hover:text-blue-400 text-sm font-medium focus:outline-none"
                                                        >
                                                            Veja menos
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Copiar Prompt */}
                                        <Button
                                            variant="outline"
                                            size="default"
                                            className="w-full bg-muted/20 border-border text-foreground hover:bg-muted/40 h-9 md:h-10 gap-2 font-medium"
                                            onClick={handleCopy}
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            {copied ? "Prompt Copiado!" : "Copiar Prompt"}
                                        </Button>

                                    </div>
                                </div>

                                {/* Instructions Block - Collapsible */}
                                {image.instructions && (
                                    <details className="group space-y-2 pt-2 [&_summary::-webkit-details-marker]:hidden">
                                        <summary className="cursor-pointer flex items-center justify-between text-[11px] font-medium uppercase text-muted-foreground tracking-widest bg-muted/20 hover:bg-muted/40 p-3 rounded-xl border border-border transition-colors">
                                            Instruções Especiais
                                            <ChevronDown className="h-4 w-4 transition-transform group-open:-rotate-180" />
                                        </summary>
                                        <div className="text-sm text-foreground/90 leading-relaxed font-light bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 mt-2">
                                            <p className="break-words text-xs md:text-sm text-blue-500/90 whitespace-pre-wrap">{image.instructions}</p>
                                        </div>
                                    </details>
                                )}

                                {/* Autor Row */}
                                {image.user && (
                                    <div className="flex items-center gap-3 py-2 md:py-3 border-y border-border">
                                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px]">
                                            <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden border border-border/50">
                                                {image.user.image ? (
                                                    <img src={image.user.image} alt={image.user.name || ""} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-xs text-foreground">{(image.user.name || "U")[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-muted-foreground">Criado por</p>
                                            <p className="text-xs md:text-sm font-medium text-foreground truncate">{image.user.name || "Usuário"}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-7 md:h-8 text-[10px] md:text-[11px] bg-muted/20 border-border hover:bg-muted/40 text-foreground rounded-full px-3 md:px-4">
                                            Seguir
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Action: Pinned Download Button */}
                        <div className="shrink-0 p-4 md:p-6 border-t border-border bg-background z-10 w-full relative">
                            <Button
                                className="w-full py-5 md:py-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] transition-all text-white font-medium text-sm md:text-base shadow-lg shadow-blue-900/40 gap-3 border-t border-white/20"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4 md:h-5 md:w-5" /> Baixar Imagem {activeImageIndex !== -1 ? "(Composição)" : ""}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
