"use client"

import { useState } from "react"
import { toggleVisibility, deleteImage } from "./actions"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

export function VisibilitySwitch({ id, initialVisible }: { id: string; initialVisible: boolean }) {
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(initialVisible)

    const handleToggle = async (checked: boolean) => {
        setLoading(true)
        setVisible(checked)
        const res = await toggleVisibility(id, !checked)
        if (!res.success) {
            setVisible(!checked)
            alert("Erro ao alterar visibilidade")
        }
        setLoading(false)
    }

    return (
        <Switch
            checked={visible}
            onCheckedChange={handleToggle}
            disabled={loading}
        />
    )
}

export function DeleteButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir esta imagem?")) return

        setLoading(true)
        const res = await deleteImage(id)
        if (!res.success) {
            alert("Erro ao excluir")
        }
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100/10"
            onClick={handleDelete}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}
