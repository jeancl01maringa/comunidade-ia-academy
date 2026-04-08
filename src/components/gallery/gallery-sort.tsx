"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ListFilter, TrendingUp, Clock, History } from "lucide-react"

export function GallerySort() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentSort = searchParams.get("sort") || "recent"

    const options = [
        { id: "trending", label: "Em alta", icon: TrendingUp },
        { id: "recent", label: "Recentes", icon: Clock },
        { id: "old", label: "Antigos", icon: History },
    ]

    const handleSort = (sortId: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("sort", sortId)
        params.delete("page") // Reset to first page
        router.replace(`${pathname}?${params.toString()}`)
    }

    const activeOption = options.find(opt => opt.id === currentSort) || options[1]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-border/60 text-muted-foreground hover:text-foreground">
                    <activeOption.icon className="h-4 w-4" />
                    <span>{activeOption.label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border w-[160px]">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option.id}
                        onClick={() => handleSort(option.id)}
                        className={`gap-2 cursor-pointer ${currentSort === option.id ? "text-blue-500 font-medium" : "text-muted-foreground"}`}
                    >
                        <option.icon className="h-4 w-4 text-inherit" />
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
