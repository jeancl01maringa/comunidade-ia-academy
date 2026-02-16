"use client"

import { useRef } from "react"
import { createAIModel } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"
import { toast } from "sonner" // Assuming sonner or generic alert

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Adicionar Modelo"}
        </Button>
    )
}

export function ModelForm() {
    const formRef = useRef<HTMLFormElement>(null)

    async function action(formData: FormData) {
        const res = await createAIModel(formData)
        if (res?.error) {
            alert(res.error)
        } else {
            formRef.current?.reset()
        }
    }

    return (
        <form ref={formRef} action={action} className="flex gap-4 items-end border p-4 rounded-lg bg-card">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="name">Nome do Modelo (ex: Midjourney v6)</Label>
                <Input type="text" id="name" name="name" placeholder="Digite o nome..." required />
            </div>
            <SubmitButton />
        </form>
    )
}
