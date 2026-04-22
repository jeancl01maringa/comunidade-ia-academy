"use client"

import { useState, useEffect } from "react"
import { updateImage } from "./actions"
import { compressImage } from "@/lib/image-optimization"
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
import { Loader2, ArrowRight, ArrowLeft, X, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"

interface EditImage {
    id: string
    title: string | null
    prompt: string
    instructions: string | null
    categoryId: string
    aiModelId: string | null
    url: string
    supportImages: string[]
}

interface EditUploadDialogProps {
    image: EditImage
    categories: { id: string; name: string }[]
    aiModels: { id: string; name: string }[]
}

export function EditUploadDialog({ image, categories, aiModels }: EditUploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [optimizing, setOptimizing] = useState(false)

    // Text fields — pre-filled
    const [title, setTitle] = useState(image.title || "")
    const [categoryId, setCategoryId] = useState(image.categoryId)
    const [aiModelId, setAiModelId] = useState(image.aiModelId || "none")
    const [prompt, setPrompt] = useState(image.prompt)
    const [instructions, setInstructions] = useState(image.instructions || "")

    // Main image: if unchanged, we keep null (re-use existing URL server-side)
    const [newMainFile, setNewMainFile] = useState<File | null>(null)
    const [mainPreview, setMainPreview] = useState<string>(image.url)

    // Support images: existing URLs + optional replacements
    const [existingSupport, setExistingSupport] = useState<string[]>(image.supportImages || [])
    const [newSupportFiles, setNewSupportFiles] = useState<File[]>([])
    const [newSupportPreviews, setNewSupportPreviews] = useState<string[]>([])

    // Reset to image values when dialog closes
    useEffect(() => {
        if (!open) {
            setStep(0)
            setTitle(image.title || "")
            setCategoryId(image.categoryId)
            setAiModelId(image.aiModelId || "none")
            setPrompt(image.prompt)
            setInstructions(image.instructions || "")
            setNewMainFile(null)
            setMainPreview(image.url)
            setExistingSupport(image.supportImages || [])
            setNewSupportFiles([])
            setNewSupportPreviews([])
        }
    }, [open, image])

    const handleMainImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewMainFile(file)
            const reader = new FileReader()
            reader.onload = () => setMainPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleAddSupportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const totalSlots = existingSupport.length + newSupportFiles.length
        const remaining = 4 - totalSlots
        if (remaining <= 0) return

        const added = files.slice(0, remaining)
        const updatedFiles = [...newSupportFiles, ...added]
        setNewSupportFiles(updatedFiles)

        const previews: string[] = [...newSupportPreviews]
        added.forEach(file => {
            const reader = new FileReader()
            reader.onload = () => {
                previews.push(reader.result as string)
                if (previews.length === updatedFiles.length) {
                    setNewSupportPreviews([...previews])
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const removeExistingSupport = (idx: number) => {
        const updated = [...existingSupport]
        updated.splice(idx, 1)
        setExistingSupport(updated)
    }

    const removeNewSupport = (idx: number) => {
        const updatedFiles = [...newSupportFiles]
        const updatedPreviews = [...newSupportPreviews]
        updatedFiles.splice(idx, 1)
        updatedPreviews.splice(idx, 1)
        setNewSupportFiles(updatedFiles)
        setNewSupportPreviews(updatedPreviews)
    }

    const totalSupport = existingSupport.length + newSupportFiles.length

    const handleNext = () => {
        if (step === 0 && (!categoryId || prompt.length < 3)) {
            toast.error("Preencha Coleção e Prompt para avançar.")
            return
        }
        setStep(step + 1)
    }

    const handleSave = async () => {
        try {
            setOptimizing(true)
            const formData = new FormData()
            formData.set("title", title)
            formData.set("categoryId", categoryId)
            formData.set("aiModelId", aiModelId)
            formData.set("prompt", prompt)
            formData.set("instructions", instructions)

            // Compress & attach main image only if replaced
            if (newMainFile) {
                const { base64 } = await compressImage(newMainFile)
                formData.set("optimizedImage", base64)
            }

            // Compress & attach new support images
            for (let i = 0; i < newSupportFiles.length; i++) {
                const { base64 } = await compressImage(newSupportFiles[i])
                formData.set(`optimizedSupport_${i}`, base64)
            }

            setOptimizing(false)
            setLoading(true)
            const res = await updateImage(image.id, formData)
            setLoading(false)

            if (res?.success) {
                setOpen(false)
                toast.success("Imagem atualizada com sucesso! ✨")
            } else {
                toast.error(res?.message || "Erro ao atualizar imagem")
            }
        } catch (error: any) {
            setOptimizing(false)
            setLoading(false)
            toast.error(`Erro: ${error?.message || "Falha desconhecida"}`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Editar Upload {step === 0 ? "- Informações" : step === 1 ? "- Imagens" : "- Revisão"}</span>
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
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Gato Cyberpunk na Chuva" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Coleção *</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
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
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {aiModels.map(model => (
                                                <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Prompt Utilizado *</Label>
                                <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="O prompt que gerou a imagem..." className="h-24" />
                            </div>
                            <div className="space-y-2">
                                <Label>Instruções (Opcional)</Label>
                                <Textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Como utilizar este prompt?" className="h-24" />
                            </div>
                        </div>
                    )}

                    {/* STEP 1: IMAGENS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                            {/* Main Image */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Imagem Principal</Label>
                                <p className="text-xs text-muted-foreground">Deixe como está ou clique para substituir.</p>
                                <div className="relative group rounded-xl overflow-hidden border">
                                    <img src={mainPreview} alt="Preview" className="w-full h-48 object-contain bg-muted/20" />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <span className="text-white text-sm font-medium">Trocar imagem</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleMainImageSelect} />
                                    </label>
                                </div>
                            </div>

                            {/* Support Images */}
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Imagens de Composição <span className="text-sm font-normal text-muted-foreground">(Máx 4)</span></Label>
                                <div className="grid grid-cols-4 gap-3">
                                    {/* Existing ones */}
                                    {existingSupport.map((url, i) => (
                                        <div key={`ex-${i}`} className="relative group rounded-lg overflow-hidden border aspect-square">
                                            <img src={url} alt={`Composição ${i + 1}`} className="w-full h-full object-cover" />
                                            <button onClick={() => removeExistingSupport(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New ones */}
                                    {newSupportPreviews.map((preview, i) => (
                                        <div key={`new-${i}`} className="relative group rounded-lg overflow-hidden border aspect-square ring-2 ring-primary/50">
                                            <img src={preview} alt={`Nova ${i + 1}`} className="w-full h-full object-cover" />
                                            <button onClick={() => removeNewSupport(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add slot */}
                                    {totalSupport < 4 && (
                                        <div className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center hover:bg-muted/40 transition-colors relative">
                                            <input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleAddSupportFiles} />
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
                                <img src={mainPreview} className="w-24 h-24 rounded-lg object-cover shadow-sm" />
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold text-lg">{title || "Sem título"}</h3>
                                    <p className="text-sm text-foreground/80">{categories.find(c => c.id === categoryId)?.name}</p>
                                    <p className="text-xs text-muted-foreground">{existingSupport.length + newSupportFiles.length} imagens de composição</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Prompt:</Label>
                                <p className="text-sm bg-muted/30 p-2 rounded-lg border line-clamp-3">{prompt}</p>
                            </div>
                            {instructions && (
                                <div className="space-y-1">
                                    <Label>Instruções:</Label>
                                    <p className="text-sm bg-blue-500/5 p-2 rounded-lg border border-blue-500/20 line-clamp-2 text-blue-500/80">{instructions}</p>
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
                        <Button onClick={handleSave} disabled={loading || optimizing} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            {(loading || optimizing) ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                            ) : "Salvar Alterações"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
