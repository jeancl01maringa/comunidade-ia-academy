"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { Search, User, LogOut, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useSidebar } from "@/components/providers/sidebar-context"

export function Navbar() {
    const { data: session } = useSession()
    const { isExpanded } = useSidebar()

    return (
        <header className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-border/10">
            <div className="w-full h-20 flex items-center justify-between gap-6 pr-10 pl-0">
                {/* Left: Logo (Hidden if sidebar is expanded) */}
                <div className={cn("flex items-center gap-2 shrink-0 transition-all duration-300", isExpanded ? "opacity-0 pointer-events-none w-0 overflow-hidden" : "opacity-100")}>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <span className="text-white font-medium text-lg italic">IA</span>
                        </div>
                        <span className="font-medium text-foreground tracking-tighter text-lg">
                            IAACADEMY
                        </span>
                    </Link>
                </div>

                {/* Middle: Search Bar */}
                <div className="flex-1 max-w-xl relative group hidden sm:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Quero criar um..."
                        className="w-full bg-muted/40 border-border h-11 pl-11 rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-muted/60 focus:border-blue-500/50 transition-all ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {session ? (
                        <>
                            {session.user.role === "ADMIN" && (
                                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-muted/40 hidden md:flex font-medium">
                                    <Link href="/admin">Admin</Link>
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 gap-2 px-3 hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-border rounded-xl">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px]">
                                            <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                                {session.user.image ? (
                                                    <img src={session.user.image} alt={session.user.name || ""} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                        <span className="hidden md:block font-medium">Minha Conta</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" sideOffset={8}>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    {session.user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                                            <Link href="/admin" className="w-full flex items-center">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Painel Admin
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem
                                        onClick={() => signOut()}
                                        className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-medium shadow-lg shadow-primary/10 border-t border-white/10">
                            <Link href="/api/auth/signin">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
