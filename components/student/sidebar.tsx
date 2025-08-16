"use client"
import { useState, useEffect, type SetStateAction, type Dispatch } from "react"
import { Home, LayoutDashboard, BookOpen, LogOut, X, LogIn, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SidebarItem } from "@/components/sidebar-item"
import { GlobalVariables } from "@/globalVariables"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar?: () => void
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export function Sidebar({ isOpen, toggleSidebar, setSidebarOpen }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  // Add state for client-side rendering
  const [mounted, setMounted] = useState(false)
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string>("")

  // Only update the path on the client side after component mounts
  useEffect(() => {
    setMounted(true)
    const savedPhoto = localStorage.getItem("profilePhoto")
    if (savedPhoto) {
      setProfilePhoto(savedPhoto)
    }
  }, [])

  if (!mounted) {
    // Don't render at all until after mount (prevents hydration mismatch)
    return null
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handlePhotoUpdate = (photo: string) => {
    setProfilePhoto(photo)
    localStorage.setItem("profilePhoto", photo)
  }

  const handleProfilePhotoClick = () => {
    if (user) {
      setIsPhotoUploadOpen(true)
    } else {
      router.push("/login")
    }
  }

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          pathname === "/" || pathname.startsWith("/student") ? "block" : "hidden",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-800">Eduportal</span>
          </div>
          {toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6  flex justify-center">
            <div className="inline-flex flex-col items-center ">
              <button
                onClick={handleProfilePhotoClick}
                className="relative group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              >
                {profilePhoto ? (
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors">
                    <img
                      src={profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <User className="h-14 w-14 rounded-full bg-gray-200 p-3 text-gray-500 group-hover:bg-gray-300 transition-colors" />
                )}
                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Edit</span>
                </div>
              </button>
              <div className="mt-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className={`mt-1 ${user ? "text-xs" : "text-sm"} text-center text-gray-500`}>
                  {GlobalVariables.non_admin.role1}
                </p>
              </div>
            </div>
          </div>
          <nav className="mt-2 px-2 space-y-1">
            <SidebarItem href="/" icon={Home} text="Home" active={isActive("/")} />
            <SidebarItem
              href="/student/dashboard"
              icon={LayoutDashboard}
              text="Dashboard"
              active={isActive("/student/dashboard")}
            />
            <SidebarItem
              href="/student/courses"
              icon={BookOpen}
              text="My Courses"
              active={isActive("/student/courses")}
            />
          </nav>
          <div className="px-2 mt-6">
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Logout
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => router.push("/login")}
              >
                <LogIn className="mr-3 h-5 w-5 text-gray-400" />
                Login
              </Button>
            )}
          </div>
        </div>
      </aside>

      <ProfilePhotoUpload
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        currentPhoto={profilePhoto}
        onPhotoUpdate={handlePhotoUpdate}
      />
    </>
  )
}
