"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const router = useRouter()
    const [query, setQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        router.push(`/?q=${encodeURIComponent(query.trim())}`)

        // Short timeout to show loading state before closing
        setTimeout(() => {
            setIsLoading(false)
            onOpenChange(false)
            setQuery("")
        }, 500)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-background/80 backdrop-blur-3xl border-border/40 p-0 overflow-hidden shadow-2xl shadow-blue-500/10 rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Pesquisar Prompts</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSearch} className="flex flex-col p-6 gap-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <Input
                            autoFocus
                            placeholder="Pesquise por um prompt"
                            className="w-full h-14 pl-12 pr-12 bg-muted/30 border-border/50 text-lg rounded-2xl focus:bg-muted/50 focus:border-blue-500/40 transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="w-full h-14 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] transition-all text-white rounded-2xl shadow-xl shadow-blue-500/20 gap-2 border-t border-white/20"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Buscar"
                        )}
                    </Button>
                </form>

                <div className="px-6 pb-6 pt-0">
                    <p className="text-xs text-center text-muted-foreground/60">
                        Pressione <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Enter</kbd> para pesquisar em toda a comunidade.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
