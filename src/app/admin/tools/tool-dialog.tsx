"use client"

import { useState } from "react"
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
import { Plus, Loader2 } from "lucide-react"
import { createTool } from "./actions"
import { toast } from "sonner"

interface NewToolDialogProps {
    categories: { id: string; name: string }[]
}

export function NewToolDialog({ categories }: NewToolDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [categoryId, setCategoryId] = useState("")
    const [isNew, setIsNew] = useState(false)
    const [isActive, setIsActive] = useState(true)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set("categoryId", categoryId)
        formData.set("isNew", isNew ? "true" : "false")
        formData.set("isActive", isActive ? "true" : "false")
        const res = await createTool(formData)
        setLoading(false)
        if (res.success) {
            toast.success("Ferramenta criada com sucesso!")
            setOpen(false)
            setCategoryId("")
            setIsNew(false)
            setIsActive(true)
        } else {
            toast.error(res.message || "Erro ao criar ferramenta.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        <div className="space-y-2">
                            <Label>URL da Imagem (logo)</Label>
                            <Input name="imageUrl" placeholder="https://..." />
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
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Criar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
