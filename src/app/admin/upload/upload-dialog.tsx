"use client"

import { useRef, useState, useEffect } from "react"
import { uploadImage } from "./actions"
import { compressImage } from "@/lib/image-optimization"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Upload, Loader2, ArrowRight, ArrowLeft, X, Image as ImageIcon, Plus } from "lucide-react"
import { toast } from "sonner"

interface UploadDialogProps {
    categories: { id: string; name: string }[]
    aiModels: { id: string; name: string }[]
}

export function UploadDialog({ categories, aiModels }: UploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0) // 0: Info, 1: Uploads, 2: Revisão
    const [loading, setLoading] = useState(false)
    const [optimizing, setOptimizing] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [aiModelId, setAiModelId] = useState("")
    const [prompt, setPrompt] = useState("")
    const [instructions, setInstructions] = useState("")

    // File State
    const [mainImage, setMainImage] = useState<File | null>(null)
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
    const [supportImages, setSupportImages] = useState<File[]>([])
    const [supportPreviews, setSupportPreviews] = useState<string[]>([])

    // Clear state on close
    useEffect(() => {
        if (!open) {
            setStep(0)
            setTitle("")
            setCategoryId("")
            setAiModelId("")
            setPrompt("")
            setInstructions("")
            setMainImage(null)
            setMainImagePreview(null)
            setSupportImages([])
            setSupportPreviews([])
        }
    }, [open])

    const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setMainImage(file)
            const reader = new FileReader()
            reader.onload = () => setMainImagePreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSupportImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const newFiles = [...supportImages, ...files].slice(0, 4) // Max 4
        setSupportImages(newFiles)

        const newPreviews: string[] = []
        newFiles.forEach((file) => {
            const reader = new FileReader()
            reader.onload = () => {
                newPreviews.push(reader.result as string)
                if (newPreviews.length === newFiles.length) {
                    setSupportPreviews(newPreviews)
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const removeSupportImage = (index: number) => {
        const newFiles = [...supportImages]
        newFiles.splice(index, 1)
        setSupportImages(newFiles)

        const newPreviews = [...supportPreviews]
        newPreviews.splice(index, 1)
        setSupportPreviews(newPreviews)
    }

    const handleNext = () => {
        if (step === 0) {
            if (!categoryId || !prompt || prompt.length < 3) {
                toast.error("Preencha Coleção e Prompt para avançar.")
                return
            }
        }
        if (step === 1) {
            if (!mainImage) {
                toast.error("Obrigatório selecionar a Imagem Principal.")
                return
            }
        }
        setStep(step + 1)
    }

    async function handleSubmit() {
        if (!mainImage || !categoryId || !prompt) return

        try {
            setOptimizing(true)
            const formData = new FormData()

            formData.set("title", title)
            formData.set("categoryId", categoryId)
            formData.set("aiModelId", aiModelId)
            formData.set("prompt", prompt)
            formData.set("instructions", instructions)

            // Compress main image
            const { base64: mainBase64 } = await compressImage(mainImage)
            formData.set("optimizedImage", mainBase64)

            // Compress support images
            for (let i = 0; i < supportImages.length; i++) {
                const { base64: supBase64 } = await compressImage(supportImages[i])
                formData.set(`optimizedSupport_${i}`, supBase64)
            }

            setOptimizing(false)
            setLoading(true)

            const res = await uploadImage(null, formData)
            setLoading(false)

            if (res?.success) {
                setOpen(false)
                toast.success("Imagem otimizada e publicada com sucesso! ✨")
            } else {
                toast.error(res?.message || "Erro ao publicar imagem")
            }
        } catch (error: any) {
            setOptimizing(false)
            setLoading(false)
            console.error("Upload error:", error)
            toast.error(`Erro ao processar: ${error?.message || "Falha desconhecida"}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Novo Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Nova Postagem {step === 0 ? " - Informações" : step === 1 ? " - Uploads" : " - Revisão"}</span>
                        <div className="flex gap-1 pr-6">
                            <div className={`h-2 w-8 rounded-full ${step >= 0 ? "bg-primary" : "bg-muted"}`} />
                            <div className={`h-2 w-8 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                            <div className={`h-2 w-8 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    {/* STEP 0: INFORMAÇÕES */}
                    {step === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                            <div className="space-y-2">
                                <Label>Título (SEO)</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Gato Cyberpunk na Chuva" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Coleção *</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Modelo de IA</Label>
                                    <Select value={aiModelId} onValueChange={setAiModelId}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {aiModels.map((model) => (
                                                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Prompt Utilizado *</Label>
                                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="O prompt que gerou a imagem..." className="h-24" />
                            </div>
                            <div className="space-y-2">
                                <Label>Instruções (Opcional)</Label>
                                <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Como utilizar este prompt? Quais variações funcionam melhor?..." className="h-24" />
                            </div>
                        </div>
                    )}

                    {/* STEP 1: UPLOADS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            {/* Main Image */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Imagem Principal *</Label>
                                <div className="flex flex-col gap-3">
                                    {mainImagePreview ? (
                                        <div className="relative group rounded-xl overflow-hidden border">
                                            <img src={mainImagePreview} alt="Preview" className="w-full h-48 object-contain bg-muted/20" />
                                            <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setMainImage(null); setMainImagePreview(null) }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors relative cursor-pointer group">
                                            <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleMainImageSelect} />
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                                <Upload className="h-8 w-8" />
                                                <span className="font-medium">Selecionar da galeria principal</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Composition Array */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Imagens de Composição/Referência <span className="text-sm font-normal text-muted-foreground">(Máx 4)</span></Label>
                                <div className="grid grid-cols-4 gap-3">
                                    {supportPreviews.map((preview, i) => (
                                        <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                                            <img src={preview} alt={`Support ${i}`} className="w-full h-full object-cover" />
                                            <button onClick={() => removeSupportImage(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {supportImages.length < 4 && (
                                        <div className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center hover:bg-muted/40 transition-colors relative">
                                            <Input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleSupportImageSelect} />
                                            <Plus className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: REVISÃO */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            <div className="flex gap-4 p-4 rounded-xl border bg-muted/10 items-center">
                                {mainImagePreview && <img src={mainImagePreview} className="w-24 h-24 rounded-lg object-cover shadow-sm" />}
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-lg">{title || "Sem título"}</h3>
                                    <p className="text-sm text-foreground/80">{categories.find(c => c.id === categoryId)?.name}</p>
                                    <p className="text-xs text-muted-foreground">{supportImages.length} imagens adicionais de composição</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Prompt:</Label>
                                <p className="text-sm bg-muted/30 p-2 rounded-lg border line-clamp-3">{prompt}</p>
                            </div>
                            {instructions && (
                                <div className="space-y-1">
                                    <Label>Instruções:</Label>
                                    <p className="text-sm bg-blue-500/5 p-2 rounded-lg border-blue-500/20 line-clamp-2 text-blue-500/80">{instructions}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-4 border-t mt-4">
                    <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0 || loading || optimizing}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                    </Button>

                    {step < 2 ? (
                        <Button onClick={handleNext}>
                            Avançar <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading || optimizing} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            {(loading || optimizing) ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                            ) : "Publicar Conteúdo"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
