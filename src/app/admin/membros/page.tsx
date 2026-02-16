import { getMembers } from "./actions"
import { MembersTable } from "./members-table"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface MembersPageProps {
    searchParams: Promise<{ page?: string; q?: string }>
}

export default async function MembrosPage({ searchParams }: MembersPageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ""

    const { members, total } = await getMembers(currentPage, 20, query)

    return (
        <div className="flex flex-col gap-8 p-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-medium tracking-tight text-foreground/90">Gestão de Membros</h1>
                        <Badge variant="secondary" className="bg-foreground/5 text-muted-foreground border-none px-2 h-5 text-[10px] flex gap-1 items-center">
                            <Users className="h-3 w-3" /> {total} usuários
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Gerencie todos os usuários e seus acessos à plataforma.
                    </p>
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden min-h-[500px]">
                <MembersTable
                    members={members as any}
                    total={total}
                    currentPage={currentPage}
                />
            </div>
        </div>
    )
}
