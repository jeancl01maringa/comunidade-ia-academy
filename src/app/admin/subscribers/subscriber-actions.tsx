"use client"

import { User } from "@prisma/client"
import {
    MessageSquare,
    Key,
    ShieldAlert,
    ShieldCheck,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SubscriberActionsProps {
    subscriber: User
}

export function SubscriberActions({ subscriber }: SubscriberActionsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleResetPassword = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${subscriber.id}/reset-password`, { method: "POST" })
            if (res.ok) {
                alert(`Senha resetada para academy@123`)
            }
        } catch (error) {
            console.error("Error resetting password:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${subscriber.id}/toggle-status`, { method: "POST" })
            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error("Error toggling status:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const whatsappLink = subscriber.phone
        ? `https://wa.me/${subscriber.phone.replace(/\D/g, "")}`
        : null

    return (
        <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
                {/* WhatsApp */}
                {whatsappLink && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#25D366] hover:bg-[#25D366]/10"
                                asChild
                            >
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="h-4 w-4" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>WhatsApp</TooltipContent>
                    </Tooltip>
                )}

                {/* Reset Password */}
                <AlertDialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-500 hover:bg-yellow-500/10"
                                    disabled={isLoading}
                                >
                                    <Key className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Resetar Senha</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent className="bg-background border-border">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Redefinir senha do assinante</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja redefinir a senha do assinante "{subscriber.name || subscriber.email}"? A nova senha será "academy@123".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetPassword}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redefinir Senha"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Toggle Status (Block/Unlock) */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                            className={cn(
                                "h-8 w-8 transition-colors",
                                subscriber.status === "ACTIVE"
                                    ? "text-red-400 hover:bg-red-400/10"
                                    : "text-green-500 hover:bg-green-500/10"
                            )}
                        >
                            {subscriber.status === "ACTIVE" ? (
                                <ShieldAlert className="h-4 w-4" />
                            ) : (
                                <ShieldCheck className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{subscriber.status === "ACTIVE" ? "Bloquear" : "Desbloquear"}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
