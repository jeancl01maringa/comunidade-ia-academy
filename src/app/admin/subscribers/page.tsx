import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { SubscriberActions } from "./subscriber-actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

export default async function SubscribersPage() {
    const subscribers = await prisma.user.findMany({
        where: {
            subscriptions: {
                some: {
                    status: "ACTIVE"
                }
            }
        },
        include: {
            subscriptions: {
                include: {
                    plan: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 1
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    const getOriginBadge = (origin: string) => {
        switch (origin.toUpperCase()) {
            case "HOTMART": return "bg-orange-500/10 text-orange-500 border-none";
            case "KIWIFY": return "bg-green-500/10 text-green-500 border-none";
            case "GREEN": return "bg-teal-500/10 text-teal-500 border-none";
            default: return "border-border/60 text-muted-foreground";
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Assinantes</h1>
                <p className="text-muted-foreground">
                    Gerencie os membros com assinatura ativa na plataforma.
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="w-[200px]">Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscribers.map((subscriber) => {
                            const sub = subscriber.subscriptions[0]
                            const expiresAt = sub?.endDate || subscriber.expiresAt

                            return (
                                <TableRow key={subscriber.id} className="border-border hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        {subscriber.name || "Sem nome"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {subscriber.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none font-medium">
                                            {sub?.plan?.name || "Premium"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {expiresAt ? format(new Date(expiresAt), "dd/MM/yyyy") : "Vitalício"}
                                            </span>
                                            {expiresAt && (
                                                <span className="text-[10px] text-green-500 font-medium whitespace-nowrap">
                                                    Vence em {Math.max(0, Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`uppercase text-[10px] font-bold ${getOriginBadge(subscriber.origin)}`}>
                                            {subscriber.origin}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={subscriber.status === "ACTIVE" ? "default" : "destructive"}
                                            className={subscriber.status === "ACTIVE" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none px-3" : ""}
                                        >
                                            {subscriber.status === "ACTIVE" ? "Ativo" : "Bloqueado"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SubscriberActions subscriber={subscriber} />
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                        {subscribers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Nenhum assinante encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
