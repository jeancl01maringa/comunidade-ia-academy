"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
    baseUrl: string
}

export function AdminPagination({ currentPage, totalPages, baseUrl }: AdminPaginationProps) {
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

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 py-6">
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} asChild={currentPage > 1}>
                    {currentPage > 1 ? (
                        <Link href={`${baseUrl}?page=1`}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronsLeft className="h-4 w-4" />
                    )}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} asChild={currentPage > 1}>
                    {currentPage > 1 ? (
                        <Link href={`${baseUrl}?page=${currentPage - 1}`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-1">
                {pages.map((p) => (
                    <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs"
                        asChild={currentPage !== p}
                    >
                        {currentPage !== p ? (
                            <Link href={`${baseUrl}?page=${p}`}>{p}</Link>
                        ) : (
                            <span>{p}</span>
                        )}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
                    {currentPage < totalPages ? (
                        <Link href={`${baseUrl}?page=${currentPage + 1}`}>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
                    {currentPage < totalPages ? (
                        <Link href={`${baseUrl}?page=${totalPages}`}>
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
