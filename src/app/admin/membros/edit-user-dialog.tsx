"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { updateManualUser } from "./actions"

interface EditUserDialogProps {
    user: any
    isOpen: boolean
    onClose: () => void
}

export function EditUserDialog({ user, isOpen, onClose }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false)
    const [accessLevel, setAccessLevel] = useState(() => {
        if (user.role === "ADMIN") return "ADMIN"
        if (user.role === "DESIGNER_ADMIN") return "DESIGNER_ADMIN"
        if (user.role === "DESIGNER") return "DESIGNER"
        if (user.expiresAt && new Date(user.expiresAt) > new Date()) return "PREMIUM"
        return "FREE"
    })

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.set("id", user.id)
        formData.set("access", accessLevel)

        const result = await updateManualUser(formData)

        setLoading(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Usuário atualizado com sucesso!", {
                icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />
            })
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-xl border border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl">Editar Membro</DialogTitle>
                    <DialogDescription>
                        Modifique as informações de acesso para <strong>{user.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-5 py-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={user.name || ""}
                                required
                                className="bg-muted/40 border-border/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email || ""}
                                required
                                className="bg-muted/40 border-border/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={user.phone || ""}
                                className="bg-muted/40 border-border/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova Senha (Deixe em branco para manter)</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-muted/40 border-border/50 font-mono"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Nível de Acesso (Cargo)</Label>
                            <Select value={accessLevel} onValueChange={setAccessLevel}>
                                <SelectTrigger className="bg-muted/40 border-border/50">
                                    <SelectValue placeholder="Selecione o acesso" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FREE">Usuário Grátis (Bloqueado no Mural)</SelectItem>
                                    <SelectItem value="PREMIUM">Assinante Premium (Painel Comum)</SelectItem>
                                    <SelectItem value="DESIGNER">Designer (Acesso só Uploads)</SelectItem>
                                    <SelectItem value="DESIGNER_ADMIN">Designer Admin (Chefe Envios)</SelectItem>
                                    <SelectItem value="ADMIN">Administrador (Deus)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {accessLevel === "PREMIUM" && (
                            <div className="grid gap-2 fade-in animate-in">
                                <Label htmlFor="duration">Renovar ou Adicionar Tempo</Label>
                                <Select name="duration" defaultValue="none">
                                    <SelectTrigger className="bg-muted/40 border-border/50">
                                        <SelectValue placeholder="Manter como está" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Manter Vencimento Atual</SelectItem>
                                        <SelectItem value="1day">+ 01 Dia</SelectItem>
                                        <SelectItem value="7days">+ 07 Dias</SelectItem>
                                        <SelectItem value="1month">+ 30 Dias (01 Mês)</SelectItem>
                                        <SelectItem value="1year">+ Anual (365 Dias)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
