"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteTool } from "./actions"
import { toast } from "sonner"

export function DeleteToolButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm("Remover esta ferramenta?")) return
        setLoading(true)
        await deleteTool(id)
        toast.success("Ferramenta removida.")
        setLoading(false)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive/60 hover:text-destructive"
            onClick={handleDelete}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}
