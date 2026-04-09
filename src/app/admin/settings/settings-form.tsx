"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { uploadLogo } from "./actions"

interface SettingsLogoFormProps {
    currentLogo: string | null
}

export function SettingsLogoForm({ currentLogo }: SettingsLogoFormProps) {
    const [preview, setPreview] = useState<string | null>(currentLogo)
    const [optimizedImage, setOptimizedImage] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione uma imagem válida.")
            return
        }

        // Preview locally
        const reader = new FileReader()
        reader.onload = (event) => {
            if (typeof event.target?.result === "string") {
                setPreview(event.target.result)
            }
        }
        reader.readAsDataURL(file)

        // Compress
        convertToWebp(file)
    }

    const convertToWebp = (file: File) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement("canvas")
                let width = img.width
                let height = img.height

                const MAX_WIDTH = 800
                const MAX_HEIGHT = 800

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width
                        width = MAX_WIDTH
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height
                        height = MAX_HEIGHT
                    }
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0, width, height)

                const webpUrl = canvas.toDataURL("image/webp", 0.8)
                setOptimizedImage(webpUrl)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!optimizedImage) {
            toast.error("Por favor aguarde a otimização da imagem ou selecione uma imagem")
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("optimizedImage", optimizedImage)

            const res = await uploadLogo(null, formData)

            if (res.success) {
                toast.success(res.message)
                window.location.reload() // Force UI update
            } else {
                toast.error(res.message)
            }
        } catch (err) {
            toast.error("Ocorreu um erro ao enviar a imagem.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h3 className="text-lg font-medium">Logotipo da Plataforma</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Faça o upload do logo que aparecerá na barra superior para todos os usuários.
                    </p>
                </div>

                <div
                    className="relative overflow-hidden border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px]"
                >
                    {preview ? (
                        <div className="relative group z-10 pointer-events-none">
                            <img
                                src={preview}
                                alt="Logo Preview"
                                className="max-h-[120px] object-contain transition-opacity group-hover:opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="h-6 w-6 text-foreground" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground z-10 pointer-events-none">
                            <ImageIcon className="h-10 w-10 opacity-50" />
                            <p className="text-sm font-medium">Clique para fazer upload</p>
                            <p className="text-xs opacity-70">PNG, JPG ou WEBP (Max 800px)</p>
                        </div>
                    )}
                    <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        onChange={handleFileChange}
                        title="Upload logo"
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Salvar Alterações"
                    )}
                </Button>
            </div>
        </form>
    )
}
