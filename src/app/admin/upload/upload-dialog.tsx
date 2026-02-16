"use client"

import { useRef, useState } from "react"
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
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner" // or alert

interface UploadDialogProps {
    categories: { id: string; name: string }[]
    aiModels: { id: string; name: string }[]
}

export function UploadDialog({ categories, aiModels }: UploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [optimizing, setOptimizing] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(formData: FormData) {
        const file = formData.get("image") as File
        if (!file || file.size === 0) {
            toast.error("Por favor, selecione uma imagem.")
            return
        }

        try {
            // 1. Otimizar imagem (Compressão + WebP)
            setOptimizing(true)
            const { base64 } = await compressImage(file)
            setOptimizing(false)

            // 2. Preparar dados para o server action
            setLoading(true)
            formData.set("optimizedImage", base64)

            const res = await uploadImage(null, formData)
            setLoading(false)

            if (res?.success) {
                setOpen(false)
                formRef.current?.reset()
                toast.success("Imagem otimizada e enviada com sucesso! ✨")
            } else {
                toast.error(res?.message || "Erro ao enviar imagem")
            }
        } catch (error) {
            setOptimizing(false)
            setLoading(false)
            console.error("Upload error:", error)
            toast.error("Erro ao processar imagem.")
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Enviar Nova Imagem</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da imagem para adicionar à galeria.
                    </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título (SEO)</Label>
                        <Input id="title" name="title" placeholder="Ex: Gato Cyberpunk na Chuva" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select name="categoryId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aiModel">Modelo de IA</Label>
                            <Select name="aiModelId">
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {aiModels.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prompt">Prompt Utilizado</Label>
                        <Textarea
                            id="prompt"
                            name="prompt"
                            placeholder="O prompt completo gerador da imagem..."
                            className="h-24"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Arquivo da Imagem</Label>
                        <Input id="image" name="image" type="file" accept="image/*" required />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || optimizing}>
                            {(loading || optimizing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {optimizing ? "Otimizando..." : loading ? "Enviando..." : "Enviar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
