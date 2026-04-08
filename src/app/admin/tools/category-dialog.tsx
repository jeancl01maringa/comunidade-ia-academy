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
import { Plus, Loader2, Trash2 } from "lucide-react"
import { createToolCategory, deleteToolCategory } from "./actions"
import { toast } from "sonner"

interface CategoryDialogProps {
    categories: { id: string; name: string; description: string | null; _count: { tools: number } }[]
}

export function ToolCategoryDialog({ categories }: CategoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [isActive, setIsActive] = useState(true)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        formData.set("isActive", isActive ? "true" : "false")
        const res = await createToolCategory(formData)
        setLoading(false)
        if (res.success) {
            toast.success("Categoria criada!")
                ; (e.target as HTMLFormElement).reset()
            setIsActive(true)
        } else {
            toast.error(res.message || "Erro ao criar categoria.")
        }
    }

    async function handleDelete(id: string) {
        setDeleting(id)
        await deleteToolCategory(id)
        toast.success("Categoria removida.")
        setDeleting(null)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" /> Nova Categoria
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Categorias</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-b pb-4">
                    <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input name="name" placeholder="Ex: Inteligência Artificial" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea name="description" placeholder="Descrição opcional..." className="h-16" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            onClick={() => setIsActive(!isActive)}
                            className={`h-5 w-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isActive ? "bg-green-600 border-green-600" : "border-border"}`}
                        >
                            {isActive && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-sm text-muted-foreground">Ativo</span>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Criar
                        </Button>
                    </div>
                </form>
                {/* Existing categories */}
                <div className="space-y-2 pt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Categorias Existentes</p>
                    {categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">Nenhuma categoria criada.</p>
                    ) : (
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium">{cat.name}</p>
                                        <p className="text-xs text-muted-foreground">{cat._count.tools} ferramentas</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive/60 hover:text-destructive"
                                        onClick={() => handleDelete(cat.id)}
                                        disabled={deleting === cat.id}
                                    >
                                        {deleting === cat.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
