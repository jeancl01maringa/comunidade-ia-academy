import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import Image from "next/image"

const getLogoQuery = unstable_cache(
    async () => {
        try {
            const setting = await prisma.systemSetting.findUnique({
                where: { key: "site_logo" }
            })
            return setting?.value || null
        } catch (error) {
            return null
        }
    },
    ["site_logo_setting"],
    { revalidate: 60 } // Cache for 60 seconds
)

export async function SiteLogo({ className, textClassName }: { className?: string, textClassName?: string }) {
    const logoUrl = await getLogoQuery()

    if (logoUrl) {
        return (
            <div className={`relative flex items-center ${className || "h-8 w-auto min-w-[120px]"}`}>
                <img
                    src={logoUrl}
                    alt="IA Academy"
                    className="max-h-full w-auto object-contain"
                />
            </div>
        )
    }

    return (
        <span className={`font-bold drop-shadow-md text-foreground ${textClassName || "text-xl"}`}>
            IA Academy
        </span>
    )
}
