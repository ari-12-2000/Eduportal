"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { X, Camera, ImageIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "./ui/use-toast"

interface ProfilePhotoUploadProps {
  isOpen: boolean
  onClose: () => void
  onPhotoUpdate: (photo: string, file: File | null) => void
}

export function ProfilePhotoUpload({ isOpen, onClose, onPhotoUpdate }: ProfilePhotoUploadProps) {
  const { user, setUser } = useAuth();
  const currentPhoto= user?.profile_image ?? '';
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(currentPhoto || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [orgPhoto, setOrgPhoto] = useState<File | null>(null)
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    return () => {
      if (selectedPhoto?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedPhoto)
      }
    }
  }, [selectedPhoto])

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // সব focusable element (পুরো ডকুমেন্ট থেকে)
    const allFocusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        `a[href], area[href], input:not([disabled]):not([type="hidden"]),
     select:not([disabled]), textarea:not([disabled]),
     button:not([disabled]), iframe, object, embed,
     [tabindex]:not([tabindex="-1"]), [contenteditable="true"]`
      )
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });;

    // modal এর ভিতরের focusable elements
    const modalFocusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        `a[href], area[href], input:not([disabled]):not([type="hidden"]),
     select:not([disabled]), textarea:not([disabled]),
     button:not([disabled]), iframe, object, embed,
     [tabindex]:not([tabindex="-1"]), [contenteditable="true"]`
      )
    ).filter(el => {
      const style = window.getComputedStyle(el);// runtime e check korar dorkar ache
      return style.display !== "none" && style.visibility !== "hidden";
    });;

    // modal এর বাইরের focusable elements বের করা
    const outsideFocusable = allFocusable.filter(el => {
      const style = window.getComputedStyle(el);
      return (
        !modalFocusable.includes(el) &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    // backup রাখব (কোনো element এ আগেই tabindex সেট করা ছিল কিনা)
    const originalTabIndex = new Map<HTMLElement, string | null>();

    // modal এর বাইরের elements temporarily disable
    outsideFocusable.forEach(el => {
      originalTabIndex.set(el, el.getAttribute("tabindex"));
      el.setAttribute("tabindex", "-1");
    });
    const firstEl = modalFocusable[0];
    console.log("Focusing modal first element:", firstEl);
    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Tab" && modalFocusable.length > 0) {
        e.preventDefault(); // browser এর default tabbing paglami বন্ধ করলাম| nahole focusable array elements er baire beriye jacche

        const firstEl = modalFocusable[0];
        const lastEl = modalFocusable[modalFocusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab pressed
          if (document.activeElement === firstEl) {
            lastEl?.focus();
          } else {
            const currentIndex = modalFocusable.indexOf(document.activeElement as HTMLElement);
            modalFocusable[currentIndex - 1]?.focus();
          }
        } else {
          // Tab pressed
          if (document.activeElement === lastEl) {
            console.log("Wrapping focus to first element");
            firstEl?.focus();
          } else {
            const currentIndex = modalFocusable.indexOf(document.activeElement as HTMLElement);
            console.log("Current index:", currentIndex, modalFocusable[currentIndex + 1]);
            modalFocusable[currentIndex + 1]?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup → আবার restore
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      outsideFocusable.forEach(el => {
        const prev = originalTabIndex.get(el);
        if (!prev) {
          el.removeAttribute("tabindex");
        } else {
          el.setAttribute("tabindex", prev);
        }
      });
    };
  }, [isOpen]);


  if (!isOpen) return null

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file)
      setSelectedPhoto(previewUrl)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
      setOrgPhoto(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
      setOrgPhoto(file)
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
      onPhotoUpdate(selectedPhoto, orgPhoto)
    }
    onClose()
  }

  const handleDelete = async () => {
    setSelectedPhoto("")
    console.log('Deleted');
    if (!currentPhoto)
      return
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/student/${user!.id}/photo`,
        {
          method: "DELETE"
        }
      );
      const data = await response.json();
      if (!response.ok){
        setSelectedPhoto(user!.profile_image ?? null);
        throw new Error(data.error)
      }
      const updatedUser = { ...user!, profile_image: '' }
      setUser(updatedUser)
      setSelectedPhoto(null)
      setOrgPhoto(null)
      onPhotoUpdate("", null)// user data update
    } catch (err: any) {
      toast({
        title: "Failed",
        description: "Couldn't delete photo",
        variant: "destructive",
      });
    } finally {
      onClose()
    }


  }

  return (
    <div className="modal fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 md:p-8" ref={modalRef}>
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
          <button onClick={onClose} aria-label="Close" ref={closeBtnRef} className="p-2">
            <X className="h-5 w-5" />
          </button>
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
          <button
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
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 border-t bg-gray-50 flex flex-col md:flex-row gap-3 md:justify-between">
          <div className="flex gap-3 order-2 md:order-1">
            {selectedPhoto && (
              <button
                type="button"
                onClick={handleDelete}
                className={"flex-1 md:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3 order-1 md:order-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-id="cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedPhoto}
              className={`flex-1 md:flex-none inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedPhoto
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              data-id="save"
            >
              Save photo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
