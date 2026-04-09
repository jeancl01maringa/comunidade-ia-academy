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
    MessageCircle,
    Moon,
    Sun,
    LayoutDashboard,
    Users,
    Settings,
    Crown
} from "lucide-react"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/providers/sidebar-context"
import { SearchDialog } from "@/components/gallery/search-dialog"

export function AppSidebar({ logoArea }: { logoArea?: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { theme, setTheme } = useTheme()
    const { isExpanded, toggleSidebar } = useSidebar()
    const [mounted, setMounted] = React.useState(false)
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const navItems = [
        { icon: Home, label: "Início", href: "/" },
        { icon: ImageIcon, label: "Galeria", href: "/biblioteca" },
        { icon: Sparkles, label: "Ferramentas IA", href: "/design" },
        { icon: Folder, label: "Coleções", href: "/collections" },
    ]

    const secondaryItems = [
        { icon: Search, label: "Pesquisar", href: "/search" },
    ]

    const adminItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Folder, label: "Modelos", href: "/admin/models" },
        { icon: Users, label: "Assinantes", href: "/admin/subscribers" },
    ]

    const WHATSAPP_URL = "https://wa.me/5544999419907?text=Ol%C3%A1%2C+preciso+de+ajuda+com+a+comunidade+IA+Academy+Pro."

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
                        <React.Suspense fallback={<div className="h-8 w-24 animate-pulse bg-muted rounded"></div>}>
                            {logoArea || <span className="font-medium text-foreground tracking-tighter text-lg whitespace-nowrap">IAACADEMY</span>}
                        </React.Suspense>
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

                {/* Admin Section */}
                {session?.user?.role === "ADMIN" && (
                    <>
                        <div className={cn("mt-4 mb-2 flex items-center px-3", !isExpanded && "justify-center")}>
                            {isExpanded ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-all">
                                    Admin
                                </span>
                            ) : (
                                <Crown className="h-3 w-3 text-muted-foreground/40" />
                            )}
                        </div>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex h-10 items-center rounded-xl transition-all duration-200",
                                        isExpanded ? "w-full px-3 gap-3" : "w-10 justify-center",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-500 font-medium"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {isExpanded && (
                                        <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </>
                )}

                <div className={cn("my-2 h-[1px] bg-border/50 transition-all", isExpanded ? "w-full mx-0" : "w-8")} />

                <button
                    onClick={() => setIsSearchOpen(true)}
                    className={cn(
                        "group relative flex h-10 items-center rounded-xl transition-all duration-200",
                        isExpanded ? "w-full px-3 gap-3" : "w-10 justify-center",
                        isSearchOpen
                            ? "bg-muted text-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    <Search className="h-5 w-5 shrink-0" />
                    {isExpanded && (
                        <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300 group-hover:translate-x-1 transition-transform">
                            Pesquisar
                        </span>
                    )}
                    {!isExpanded && <span className="sr-only">Pesquisar</span>}
                </button>

                {/* Suporte via WhatsApp */}
                <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "group relative flex h-10 items-center rounded-xl transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        isExpanded ? "w-full px-3 gap-3" : "w-10 justify-center"
                    )}
                >
                    <MessageCircle className="h-5 w-5 shrink-0" />
                    {isExpanded && (
                        <span className="text-sm animate-in fade-in slide-in-from-left-2 duration-300 group-hover:translate-x-1 transition-transform">
                            Suporte
                        </span>
                    )}
                    {!isExpanded && <span className="sr-only">Suporte</span>}
                </a>

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

            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </aside>
    )
}
