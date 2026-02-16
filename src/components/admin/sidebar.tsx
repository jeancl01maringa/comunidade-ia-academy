"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Upload, LogOut, Image as ImageIcon, Tags, Cpu } from "lucide-react"
import { signOut } from "next-auth/react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Membros",
        href: "/admin/membros",
        icon: Users,
    },
    {
        title: "Integrações",
        href: "/admin/integracoes",
        icon: Cpu,
    },
    {
        title: "Uploads",
        href: "/admin/upload",
        icon: Upload,
    },
    {
        title: "Categorias",
        href: "/admin/categories",
        icon: Tags,
    },
    {
        title: "Modelos IA",
        href: "/admin/models",
        icon: Cpu,
    },
    {
        title: "Galeria Admin",
        href: "/admin/gallery",
        icon: ImageIcon,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col border-r bg-muted/20">
            <div className="flex h-14 items-center px-10">
                <Link href="/" className="flex items-center gap-2 font-medium">
                    <span className="text-foreground">Admin Panel</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted/40 ${isActive
                                    ? "bg-muted/60 text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
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
