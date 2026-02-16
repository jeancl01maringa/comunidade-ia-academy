"use client"

import { useRef } from "react"
import { createCategory } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
        </Button>
    )
}

export function CategoryForm() {
    const formRef = useRef<HTMLFormElement>(null)

    async function action(formData: FormData) {
        const res = await createCategory(formData)
        if (res?.error) {
            alert(res.error)
        } else {
            formRef.current?.reset()
        }
    }

    return (
        <form ref={formRef} action={action} className="flex gap-4 items-end">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Nova Categoria</Label>
                <Input type="text" id="name" name="name" placeholder="Nome da categoria..." required />
            </div>
            <SubmitButton />
        </form>
    )
}
