import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import Image from "next/image"

const getLogosQuery = unstable_cache(
    async () => {
        try {
            const settings = await prisma.systemSetting.findMany({
                where: { key: { in: ["site_logo_dark", "site_logo_light", "site_logo"] } }
            })
            return {
                dark: settings.find(s => s.key === "site_logo_dark")?.value || settings.find(s => s.key === "site_logo")?.value || null,
                light: settings.find(s => s.key === "site_logo_light")?.value || settings.find(s => s.key === "site_logo")?.value || null
            }
        } catch (error) {
            return { dark: null, light: null }
        }
    },
    ["site_logos_setting"],
    { revalidate: 60 } // Cache for 60 seconds
)

export async function SiteLogo({ className, textClassName }: { className?: string, textClassName?: string }) {
    const logos = await getLogosQuery()

    if (logos.dark || logos.light) {
        return (
            <div className={`relative flex items-center justify-center shrink-0 ${className || "h-8 w-auto min-w-[120px]"}`}>
                {logos.dark && (
                    <img
                        src={logos.dark}
                        alt="IA Academy"
                        className="h-auto w-auto max-w-[120px] object-contain hidden dark:block"
                    />
                )}
                {logos.light && (
                    <img
                        src={logos.light}
                        alt="IA Academy"
                        className="h-auto w-auto max-w-[120px] object-contain block dark:hidden"
                    />
                )}
            </div>
        )
    }

    return (
        <span className={`font-bold drop-shadow-md text-foreground ${textClassName || "text-xl"}`}>
            IA Academy
        </span>
    )
}
