"use client"
import { useState, useRef } from "react"
import type React from "react"

import { X, Camera, ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfilePhotoUploadProps {
  isOpen: boolean
  onClose: () => void
  currentPhoto?: string
  onPhotoUpdate: (photo: string) => void
}

export function ProfilePhotoUpload({ isOpen, onClose, currentPhoto, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(currentPhoto || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedPhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleSave = () => {
    if (selectedPhoto) {
      onPhotoUpdate(selectedPhoto)
    }
    onClose()
  }

  const handleDelete = () => {
    setSelectedPhoto(null)
    onPhotoUpdate("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 md:p-8">
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl w-full max-w-md mx-auto",
          "md:max-w-lg md:w-auto",
          "h-full md:h-auto",
          "flex flex-col",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Profile photo</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center space-y-6">
          {/* Photo Preview */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto || "/placeholder.svg"}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Camera className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              "w-full border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors",
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
              "cursor-pointer hover:border-gray-400",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm md:text-base text-gray-600 mb-2">Drag and drop a photo here, or click to select</p>
            <p className="text-xs md:text-sm text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col md:flex-row gap-3 md:justify-between">
          <div className="flex gap-3 order-2 md:order-1">
            {selectedPhoto && (
              <Button variant="outline" onClick={handleDelete} className="flex-1 md:flex-none bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-3 order-1 md:order-2">
            <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!selectedPhoto} className="flex-1 md:flex-none">
              Save photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
