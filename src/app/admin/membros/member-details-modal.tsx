"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, CreditCard, ShieldCheck, Clock, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MemberDetailsModalProps {
    member: any
    isOpen: boolean
    onClose: () => void
}

export function MemberDetailsModal({ member, isOpen, onClose }: MemberDetailsModalProps) {
    if (!member) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl">
                <div className="flex flex-col">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-border/10 flex items-center px-8">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center text-2xl font-bold border border-border shadow-2xl">
                                {member.image ? <img src={member.image} alt="" className="h-full w-full object-cover rounded-2xl" /> : (member.name || "U")[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-medium text-foreground">{member.name || "Sem Nome"}</h2>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-foreground/5 text-muted-foreground border-none text-[10px] px-2 h-5">
                                        ID: {member.id}
                                    </Badge>
                                    <Badge variant="outline" className="border-border/50 text-muted-foreground text-[10px] px-2 h-5">
                                        {member.origin}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-2 gap-8">
                        {/* Info Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Informações de Contato</p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-sm text-foreground/80 bg-muted/20 p-3 rounded-xl border border-border/10">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="truncate">{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground/80 bg-muted/20 p-3 rounded-xl border border-border/10">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Entrou em {format(new Date(member.createdAt), "dd/MM/yyyy")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Assinatura</p>
                                <div className="bg-muted/20 p-4 rounded-xl border border-border/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Status</span>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none px-2 rounded-lg">Ativo</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Expiração</span>
                                        <span className="text-xs font-medium text-foreground">{member.expiresAt ? format(new Date(member.expiresAt), "dd/MM/yyyy") : "Vitalício"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Histórico de Pagamento</p>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-dark">
                                    {member.payments?.length > 0 ? (
                                        member.payments.map((payment: any) => (
                                            <div key={payment.id} className="bg-muted/10 p-3 rounded-xl border border-border/10 flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-medium text-foreground">R$ {payment.amount.toFixed(2)}</span>
                                                    <span className="text-[10px] text-muted-foreground">{format(new Date(payment.createdAt), "dd/MM", { locale: ptBR })} • {payment.gateway}</span>
                                                </div>
                                                <Badge className="h-4 text-[9px] bg-foreground/5 text-muted-foreground border-none">Pago</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/5 rounded-xl border border-dashed border-border/50">Nenhum pagamento registrado.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <Button className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 gap-2 font-medium">
                                    <Clock className="h-4 w-4" /> Prorrogar Acesso
                                </Button>
                                <Button variant="outline" className="w-full h-11 rounded-xl border-border/50 gap-2 font-medium text-red-500 hover:text-red-400 hover:bg-red-500/5">
                                    <ShieldCheck className="h-4 w-4" /> Bloquear Membro
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
