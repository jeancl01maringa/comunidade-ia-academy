"use client"

import { Category } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function CategoryFilter({ categories }: { categories: Category[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentCategory = searchParams.get("category")

    const handleFilter = (categoryId: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (categoryId) {
            params.set("category", categoryId)
        } else {
            params.delete("category")
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2 pb-6">
            <Button
                variant={currentCategory === null ? "default" : "outline"}
                onClick={() => handleFilter(null)}
                size="sm"
                className="rounded-full"
            >
                Todas
            </Button>
            {categories.map((cat) => (
                <Button
                    key={cat.id}
                    variant={currentCategory === cat.id ? "default" : "outline"}
                    onClick={() => handleFilter(cat.id)}
                    size="sm"
                    className="rounded-full"
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    )
}
