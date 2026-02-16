import { Sidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-background">
            <div className="hidden border-r border-white/5 bg-black/20 md:block">
                <Sidebar />
            </div>
            <div className="flex flex-col">
                <header className="flex h-16 items-center gap-4 bg-background/0 px-10 md:hidden">
                    <span className="font-medium text-foreground">Admin Panel</span>
                </header>
                <main className="flex flex-1 flex-col gap-6 pr-10 pl-0 py-10 bg-background">
                    {children}
                </main>
            </div>
        </div>
    )
}
