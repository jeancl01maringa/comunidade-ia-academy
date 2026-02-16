"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    PanelLeft,
    Home,
    Image as ImageIcon,
    Sparkles,
    Folder,
    Search,
    Hash,
    Library,
    Box,
    Moon,
    Sun
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/providers/sidebar-context"

export function AppSidebar() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { isExpanded, toggleSidebar } = useSidebar()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const navItems = [
        { icon: Home, label: "Início", href: "/" },
        { icon: ImageIcon, label: "Galeria", href: "/gallery" },
        { icon: Sparkles, label: "Design", href: "/design" },
        { icon: Folder, label: "Coleções", href: "/collections" },
    ]

    const secondaryItems = [
        { icon: Search, label: "Pesquisar", href: "/search" },
        { icon: Hash, label: "Hashtags", href: "/tags" },
        { icon: Library, label: "Biblioteca", href: "/library" },
        { icon: Box, label: "3D", href: "/3d" },
    ]

    const isAuthPage = pathname === "/login"

    if (!mounted || isAuthPage) return null

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-[60] flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out",
                isExpanded ? "w-64" : "w-16 items-center"
            )}
        >
            {/* Header with Logo or Toggle */}
            <div className={cn(
                "flex items-center h-20 px-3 w-full",
                isExpanded ? "justify-between" : "justify-center"
            )}>
                {isExpanded && (
                    <Link href="/" className="flex items-center gap-2 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-medium text-lg italic">IA</span>
                        </div>
                        <span className="font-medium text-foreground tracking-tighter text-lg whitespace-nowrap">
                            IAACADEMY
                        </span>
                    </Link>
                )}
                <Button
                    onClick={toggleSidebar}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground transition-all"
                >
                    <PanelLeft className={cn("h-5 w-5 transition-transform duration-300", isExpanded && "rotate-180")} />
                </Button>
            </div>

            {/* Main Navigation */}
            <div className={cn(
                "flex flex-1 flex-col gap-2 px-3",
                !isExpanded && "items-center"
            )}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex h-10 items-center rounded-xl transition-all duration-200",
                                isExpanded ? "w-full px-3 gap-3" : "w-10 justify-center",
                                isActive
                                    ? "bg-muted text-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isExpanded && (
                                <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300 group-hover:translate-x-1 transition-transform">
                                    {item.label}
                                </span>
                            )}
                            {!isExpanded && <span className="sr-only">{item.label}</span>}
                        </Link>
                    )
                })}

                <div className={cn("my-2 h-[1px] bg-border/50 transition-all", isExpanded ? "w-full mx-0" : "w-8")} />

                {secondaryItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex h-10 items-center rounded-xl transition-all duration-200",
                                isExpanded ? "w-full px-3 gap-3" : "w-10 justify-center",
                                isActive
                                    ? "bg-muted text-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isExpanded && (
                                <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300 group-hover:translate-x-1 transition-transform">
                                    {item.label}
                                </span>
                            )}
                            {!isExpanded && <span className="sr-only">{item.label}</span>}
                        </Link>
                    )
                })}

                {/* Theme Toggle bottom fixed */}
                <div className="mt-auto pb-4 pt-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={cn(
                            "h-10 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all",
                            isExpanded ? "w-full px-3 gap-3 justify-start" : "w-10 justify-center"
                        )}
                    >
                        <div className="relative h-5 w-5 shrink-0">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        {isExpanded && (
                            <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                            </span>
                        )}
                        <span className="sr-only">Alternar tema</span>
                    </Button>
                </div>
            </div>
        </aside>
    )
}
