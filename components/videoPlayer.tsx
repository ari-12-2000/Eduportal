"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useRef } from "react"

interface VideoPlayerProps {
    src: string
    handleMarkProgress: () => Promise<void>
    id: number
    completedResources: Set<number>
}

const VideoPlayer = ({ src, handleMarkProgress, id, completedResources}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const markedCompletedRef = useRef(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime
            const duration = video.duration
            if (!markedCompletedRef.current && duration && currentTime / duration >= 0.9) {
                markedCompletedRef.current = true
                handleMarkProgress()
            }
        }

        const handleEnded = () => {
            if (markedCompletedRef.current) return
            markedCompletedRef.current = true
            handleMarkProgress()
        }

        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("ended", handleEnded)

        // If resource is already completed, seek to end once metadata is loaded
        if (completedResources.has(id)) {
            const handleLoadedMetadata = () => {
                video.currentTime = video.duration
            }

            video.addEventListener("loadedmetadata", handleLoadedMetadata)

            // Clean up
            return () => {
                video.removeEventListener("timeupdate", handleTimeUpdate)
                video.removeEventListener("ended", handleEnded)
                video.removeEventListener("loadedmetadata", handleLoadedMetadata)
            }
        }

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("ended", handleEnded)
        }
    }, [completedResources, id, handleMarkProgress])

    return (
        <div className="max-w-3xl mx-auto p-4">
            <video
                ref={videoRef}
                width="100%"
                controls
                className="rounded shadow"
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}

export default VideoPlayer

