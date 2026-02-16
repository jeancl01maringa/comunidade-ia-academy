"use client"

import { useTransition } from "react"
import { deleteCategory } from "./actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function DeleteCategoryButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500"
            disabled={isPending}
            onClick={() => {
                if (confirm("Tem certeza?")) {
                    startTransition(async () => {
                        const res = await deleteCategory(id)
                        if (res?.error) alert(res.error)
                    })
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
