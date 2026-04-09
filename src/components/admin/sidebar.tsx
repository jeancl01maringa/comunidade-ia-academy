"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Upload, LogOut, Image as ImageIcon, Tags, Cpu, Wrench, Settings } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const sidebarGroups = [
    {
        label: "Principal",
        items: [
            { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        label: "Monetização",
        items: [
            { title: "Membros", href: "/admin/membros", icon: Users },
            { title: "Assinantes", href: "/admin/subscribers", icon: Users },
        ]
    },
    {
        label: "Conteúdos",
        items: [
            { title: "Uploads", href: "/admin/upload", icon: Upload },
            { title: "Coleções", href: "/admin/categories", icon: Tags },
            { title: "Modelos IA", href: "/admin/models", icon: Cpu },
            { title: "Ferramentas", href: "/admin/tools", icon: Wrench },
        ]
    },
    {
        label: "Configurações",
        items: [
            { title: "Integrações", href: "/admin/integracoes", icon: Cpu },
            { title: "Personalizar", href: "/admin/settings", icon: Settings },
        ]
    }
]

export function Sidebar({ logoArea }: { logoArea?: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()

    const role = session?.user?.role || "USER"

    // Filter logic
    const filteredGroups = sidebarGroups.map(group => {
        if (role === "ADMIN") return group // god mode

        if (role === "DESIGNER_ADMIN") {
            // Keep only components from Conteúdos
            if (group.label === "Conteúdos") return group
            return null
        }

        if (role === "DESIGNER") {
            // Keep only the Uploads route from Conteúdos
            if (group.label === "Conteúdos") {
                return {
                    ...group,
                    items: group.items.filter(i => i.title === "Uploads")
                }
            }
            return null
        }

        return null
    }).filter(Boolean)

    return (
        <div className="flex h-full flex-col border-r bg-muted/20">
            <div className="flex h-14 items-center px-10 overflow-hidden">
                <Link href="/" className="flex items-center gap-2 font-medium overflow-hidden">
                    {logoArea || <span className="text-foreground text-sm font-semibold">IA Academy</span>}
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-6">
                    {filteredGroups.map((group) => (
                        group && (
                            <div key={group.label} className="flex flex-col gap-1">
                                <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                                    {group.label}
                                </h4>
                                <div className="flex flex-col gap-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted/40 ${isActive
                                                    ? "bg-muted/60 text-foreground font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {item.title}
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-primary"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
