"use client"

import { Category } from "../../generated/prisma"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function LibraryFilter({ categories }: { categories: Category[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentCategory = searchParams.get("category")

    const handleFilter = (categoryId: string | null) => {
        const params = new URLSearchParams(searchParams)
        // Reset page to 1 when changing filters
        params.delete("page")

        if (categoryId) {
            params.set("category", categoryId)
        } else {
            params.delete("category")
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="relative w-full">
            <ScrollArea className="w-full pb-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => handleFilter(null)}
                        size="sm"
                        className={cn(
                            "rounded-full px-6 h-9 text-xs font-medium transition-all duration-300",
                            currentCategory === null
                                ? "bg-foreground text-background hover:bg-foreground/90"
                                : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                    >
                        Todos
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant="ghost"
                            onClick={() => handleFilter(cat.id)}
                            size="sm"
                            className={cn(
                                "rounded-full px-6 h-9 text-xs font-medium transition-all duration-300 whitespace-nowrap",
                                currentCategory === cat.id
                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                    : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
        </div>
    )
}
