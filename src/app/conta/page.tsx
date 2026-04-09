import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { SiteLogo } from "@/components/ui/site-logo"
import { AccountClient } from "./account-client"

export const dynamic = "force-dynamic"
export const metadata = { title: "Minha Conta | IAACADEMY" }

export default async function ContaPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) redirect("/login")

    const [user, subscription, likedImages, savedImages] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, image: true },
        }),
        prisma.subscription.findFirst({
            where: { userId: session.user.id },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.like.findMany({
            where: { userId: session.user.id },
            include: {
                image: {
                    include: {
                        category: true,
                        aiModel: true,
                        user: { select: { id: true, name: true, image: true } },
                        _count: { select: { likes: true, saves: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.save.findMany({
            where: { userId: session.user.id },
            include: {
                image: {
                    include: {
                        category: true,
                        aiModel: true,
                        user: { select: { id: true, name: true, image: true } },
                        _count: { select: { likes: true, saves: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
    ])

    if (!user) redirect("/login")

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar logoArea={<SiteLogo />} />
            <main className="flex-1 w-full overflow-hidden">
                <AccountClient
                    user={user}
                    likedImages={likedImages.map(l => l.image)}
                    savedImages={savedImages.map(s => s.image)}
                    subscription={subscription ? {
                        status: subscription.status,
                        startDate: subscription.startDate,
                        endDate: subscription.endDate,
                        plan: {
                            name: subscription.plan.name,
                            interval: subscription.plan.interval,
                            price: subscription.plan.price,
                        },
                    } : null}
                />
            </main>
        </div>
    )
}
