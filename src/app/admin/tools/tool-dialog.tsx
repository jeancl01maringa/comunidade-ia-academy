"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, ImageIcon, X } from "lucide-react"
import { createTool, uploadToolLogo } from "./actions"
import { compressImage } from "@/lib/image-optimization"
import { toast } from "sonner"

interface NewToolDialogProps {
    categories: { id: string; name: string }[]
}

export function NewToolDialog({ categories }: NewToolDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [categoryId, setCategoryId] = useState("")
    const [isNew, setIsNew] = useState(false)
    const [isActive, setIsActive] = useState(true)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 3 * 1024 * 1024) {
            toast.error("Imagem muito grande. Máximo: 3MB.")
            return
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Formato inválido. Use JPG ou PNG.")
            return
        }

        setUploading(true)
        try {
            const { base64 } = await compressImage(file, { maxWidth: 256, quality: 0.9 })
            setLogoPreview(base64)

            const formData = new FormData()
            formData.set("imageBase64", base64)
            const res = await uploadToolLogo(formData)
            if (res.success && res.imageUrl) {
                setLogoUrl(res.imageUrl)
                toast.success("Logo enviado!")
            } else {
                toast.error(res.message || "Erro ao enviar logo.")
                setLogoPreview(null)
            }
        } catch {
            toast.error("Erro ao processar imagem.")
            setLogoPreview(null)
        } finally {
            setUploading(false)
        }
    }

    function resetForm() {
        setCategoryId("")
        setIsNew(false)
        setIsActive(true)
        setLogoPreview(null)
        setLogoUrl(null)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set("categoryId", categoryId)
        formData.set("isNew", isNew ? "true" : "false")
        formData.set("isActive", isActive ? "true" : "false")
        formData.set("imageUrl", logoUrl || "")
        const res = await createTool(formData)
        setLoading(false)
        if (res.success) {
            toast.success("Ferramenta criada!")
            setOpen(false)
            resetForm()
        } else {
            toast.error(res.message || "Erro ao criar ferramenta.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] transition-all shadow-md shadow-blue-900/30 border-none">
                    <Plus className="h-4 w-4" /> Nova Ferramenta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Nova Ferramenta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome *</Label>
                            <Input name="name" placeholder="Ex: ChatGPT" required />
                        </div>
                        <div className="space-y-2">
                            <Label>URL *</Label>
                            <Input name="url" placeholder="https://chat.openai.com" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea name="description" placeholder="Descreva brevemente a ferramenta..." className="h-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label>Logo da Ferramenta</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-3 h-9 px-3 rounded-md border border-border bg-muted/10 cursor-pointer hover:bg-muted/30 transition-colors"
                            >
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : logoPreview ? (
                                    <>
                                        <img src={logoPreview} alt="logo" className="h-6 w-6 rounded object-cover" />
                                        <span className="text-xs text-green-500 flex-1 truncate">Enviado ✓</span>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setLogoUrl(null) }}
                                            className="text-muted-foreground hover:text-foreground shrink-0"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-xs text-muted-foreground">JPG, PNG · máx 3MB</span>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">Convertida para WebP automaticamente</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                onClick={() => setIsNew(!isNew)}
                                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${isNew ? "bg-blue-600 border-blue-600" : "border-border"}`}
                            >
                                {isNew && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-sm text-muted-foreground">Marcar como Novo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div
                                onClick={() => setIsActive(!isActive)}
                                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${isActive ? "bg-green-600 border-green-600" : "border-border"}`}
                            >
                                {isActive && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span className="text-sm text-muted-foreground">Ativo</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading || uploading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Criar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
