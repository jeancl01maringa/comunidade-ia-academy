"use client"

import { Image as ImageType, Category, User, AIModel } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Copy, Download, Check, Maximize2, ShieldAlert, Bug, Cpu } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Define a type that matches the serialized image
type SerializedImage = Omit<ImageType, "createdAt" | "updatedAt"> & {
    createdAt: string | Date
    updatedAt: string | Date
    category?: Category | null
    aiModel?: AIModel | null
    user?: Pick<User, "id" | "name" | "image"> | null
}

export function ImageCard({ image }: { image: SerializedImage }) {
    const [copied, setCopied] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(image.prompt)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = image.url
        link.download = `image-${image.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const isLongPrompt = image.prompt.length > 150

    return (
        <Dialog>
            <div className="group relative break-inside-avoid overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg">
                <DialogTrigger asChild>
                    <div className="relative w-full overflow-hidden cursor-pointer">
                        <img
                            src={image.url}
                            alt={image.title || image.prompt}
                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                </DialogTrigger>
            </div>

            <DialogContent className="sm:max-w-none md:w-[960px] w-[95vw] h-fit max-h-[95vh] md:max-h-[650px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border shadow-2xl ring-1 ring-border transition-all">
                <div className="flex flex-col md:flex-row h-auto min-h-0">
                    {/* Left side: Image */}
                    <div className="w-full md:w-[48%] bg-muted/20 flex items-center justify-center relative min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-border p-5">
                        <img
                            src={image.url}
                            alt={image.title || image.prompt}
                            className="w-full h-auto object-contain max-h-[50vh] md:max-h-[610px] rounded-2xl shadow-2xl"
                        />
                    </div>

                    {/* Right side: Information */}
                    <div className="w-full md:w-[52%] flex flex-col p-6 overflow-y-auto scrollbar-dark">
                        <div className="space-y-6 flex-1">
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
                                    <DialogTitle className="text-lg font-medium text-foreground leading-tight">
                                        {image.title || "Imagem Gerada por IA"}
                                    </DialogTitle>
                                </DialogHeader>
                                {/* Small utility actions */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                                        <ShieldAlert className="h-3 w-3" /> Denunciar
                                    </button>
                                    <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                                        <Bug className="h-3 w-3" /> Bug
                                    </button>
                                </div>
                            </div>

                            {/* Prompt Section */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-widest">Prompt original</p>
                                <div className="space-y-4">
                                    <div className="text-sm text-foreground/90 leading-relaxed font-light bg-muted/20 p-4 rounded-xl border border-border">
                                        {isLongPrompt && !expanded ? (
                                            <div>
                                                <p className="break-words">{image.prompt.slice(0, 150)}...</p>
                                                <button
                                                    onClick={() => setExpanded(true)}
                                                    className="text-blue-500 hover:text-blue-400 text-sm font-medium mt-3 focus:outline-none flex items-center gap-1"
                                                >
                                                    Veja mais <Maximize2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className={`break-words ${isLongPrompt ? "max-h-[200px] md:max-h-[150px] overflow-y-auto pr-2 scrollbar-dark" : ""}`}>
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
                                        className="w-full bg-muted/20 border-border text-foreground hover:bg-muted/40 h-10 gap-2 font-medium"
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Prompt Copiado!" : "Copiar Prompt"}
                                    </Button>
                                </div>
                            </div>

                            {/* Autor Row */}
                            {image.user && (
                                <div className="flex items-center gap-3 py-3 border-y border-border">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px]">
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
                                        <p className="text-sm font-medium text-foreground truncate">{image.user.name || "Usuário"}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-8 text-[11px] bg-muted/20 border-border hover:bg-muted/40 text-foreground rounded-full px-4">
                                        Seguir
                                    </Button>
                                </div>
                            )}

                            {/* Footer Action: Baixar imagem - MOVED HERE */}
                            <div className="pt-2">
                                <Button
                                    className="w-full py-7 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-medium text-base shadow-xl shadow-blue-900/40 gap-3 border-t border-white/20"
                                    onClick={handleDownload}
                                >
                                    <Download className="h-5 w-5" /> Baixar Imagem
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
