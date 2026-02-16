"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface PaginationProps {
    currentPage: number
    totalPages: number
    baseUrl: string
}

export function GalleryPagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const searchParams = useSearchParams()

    if (totalPages <= 1) return null

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `${baseUrl}?${params.toString()}`
    }

    const pages = []
    const showMax = 5

    let start = Math.max(1, currentPage - Math.floor(showMax / 2))
    let end = Math.min(totalPages, start + showMax - 1)

    if (end - start + 1 < showMax) {
        start = Math.max(1, end - showMax + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return (
        <div className="flex items-center justify-center gap-2 py-10">
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                >
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(1)}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronsLeft className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                    disabled={currentPage <= 1}
                    asChild={currentPage > 1}
                >
                    {currentPage > 1 ? (
                        <Link href={createPageUrl(currentPage - 1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-1 mx-2">
                {pages.map((p) => (
                    <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="icon"
                        className={p === currentPage
                            ? "h-10 w-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10"
                            : "h-10 w-10 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-accent text-xs"}
                        asChild={currentPage !== p}
                    >
                        {currentPage !== p ? (
                            <Link href={createPageUrl(p)}>{p}</Link>
                        ) : (
                            <span>{p}</span>
                        )}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                >
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(currentPage + 1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                    disabled={currentPage >= totalPages}
                    asChild={currentPage < totalPages}
                >
                    {currentPage < totalPages ? (
                        <Link href={createPageUrl(totalPages)}>
                            <ChevronsRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronsRight className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}
