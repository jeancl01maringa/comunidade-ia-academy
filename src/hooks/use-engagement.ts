"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function useEngagement(imageId: string, initialLikes = 0, initialSaves = 0) {
    const [likes, setLikes] = useState(initialLikes)
    const [saves, setSaves] = useState(initialSaves)
    const [isLiking, setIsLiking] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const trackView = async () => {
        try {
            await fetch(`/api/engagement/${imageId}/view`, { method: "POST" })
        } catch (error) {
            console.error("Error tracking view:", error)
        }
    }

    const trackCopy = async () => {
        try {
            await fetch(`/api/engagement/${imageId}/copy`, { method: "POST" })
        } catch (error) {
            console.error("Error tracking copy:", error)
        }
    }

    const toggleLike = async () => {
        setIsLiking(true)
        try {
            const res = await fetch(`/api/engagement/${imageId}/like`, { method: "POST" })
            if (res.ok) {
                const data = await res.json()
                setLikes(data.count)
                router.refresh()
            }
        } catch (error) {
            console.error("Error toggling like:", error)
        } finally {
            setIsLiking(false)
        }
    }

    const toggleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/engagement/${imageId}/save`, { method: "POST" })
            if (res.ok) {
                const data = await res.json()
                setSaves(data.count)
                router.refresh()
            }
        } catch (error) {
            console.error("Error toggling save:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return {
        likes,
        saves,
        isLiking,
        isSaving,
        trackView,
        trackCopy,
        toggleLike,
        toggleSave
    }
}
