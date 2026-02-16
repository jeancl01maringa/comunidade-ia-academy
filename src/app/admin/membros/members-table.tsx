"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, Eye, Calendar, ShieldCheck } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { MemberDetailsModal } from "./member-details-modal"

interface MembersTableProps {
    members: any[]
    total: number
    currentPage: number
}

export function MembersTable({ members, total, currentPage }: MembersTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
    const [selectedMember, setSelectedMember] = useState<any | null>(null)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)
        if (searchTerm) params.set("q", searchTerm)
        else params.delete("q")
        params.delete("page")
        router.push(`/admin/membros?${params.toString()}`)
    }

    const getStatusBadge = (status: string, expiresAt?: Date) => {
        const isExpired = expiresAt && new Date(expiresAt) < new Date()

        if (status === "BLOCKED") return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-none px-2 rounded-lg">Bloqueado</Badge>
        if (isExpired) return <Badge variant="outline" className="text-muted-foreground border-border/50 px-2 rounded-lg">Expirado</Badge>
        return <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none px-2 rounded-lg">Ativo</Badge>
    }

    const getOriginBadge = (origin: string) => {
        switch (origin) {
            case "HOTMART": return <Badge variant="outline" className="border-orange-500/30 text-orange-500 px-2 rounded-lg">Hotmart</Badge>
            case "KIWIFY": return <Badge variant="outline" className="border-green-500/30 text-green-500 px-2 rounded-lg">Kiwify</Badge>
            case "GREEN": return <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 px-2 rounded-lg">Green</Badge>
            default: return <Badge variant="outline" className="border-border/50 text-muted-foreground px-2 rounded-lg">Direto</Badge>
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/5">
                <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        className="pl-9 h-10 rounded-xl bg-background border-border/50 focus:ring-1 focus:ring-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground w-[300px]">Membro</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Origem</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Status</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Membro desde</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Expira em</TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length > 0 ? (
                        members.map((member) => (
                            <TableRow key={member.id} className="border-border/50 hover:bg-muted/10 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center text-xs font-medium border border-border/10 overflow-hidden">
                                            {member.image ? <img src={member.image} alt="" className="h-full w-full object-cover" /> : (member.name || "U")[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{member.name || "Sem nome"}</span>
                                            <span className="text-xs text-muted-foreground">{member.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{getOriginBadge(member.origin)}</TableCell>
                                <TableCell>{getStatusBadge(member.status, member.expiresAt)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(member.createdAt), { addSuffix: true, locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {member.expiresAt ? format(new Date(member.expiresAt), "dd/MM/yyyy") : "Vitalício"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-foreground/5"
                                        onClick={() => setSelectedMember(member)}
                                    >
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic text-sm">
                                Nenhum membro encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {selectedMember && (
                <MemberDetailsModal
                    member={selectedMember}
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    )
}
