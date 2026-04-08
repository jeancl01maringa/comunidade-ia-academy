"use client"

import * as React from "react"
import { AppSidebar } from "./app-sidebar"
import { useSidebar } from "@/components/providers/sidebar-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SessionProvider } from "@/components/providers/session-provider"

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { isExpanded } = useSidebar()
    const pathname = usePathname()
    const isLoginPage = pathname === "/login"

    if (isLoginPage) {
        return <SessionProvider>{children}</SessionProvider>
    }

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div
                className={cn(
                    "flex-1 transition-all duration-300",
                    isExpanded ? "pl-[296px]" : "pl-[104px]"
                )}
            >
                <SessionProvider>{children}</SessionProvider>
            </div>
        </div>
    )
}
