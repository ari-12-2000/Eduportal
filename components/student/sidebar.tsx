"use client"
import { useState, useEffect } from "react"
import { Home, LayoutDashboard, BookOpen, Video, FileText, LogOut, X, ClipboardCheck, LogIn, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SidebarItem } from "@/components/sidebar-item"
import { GlobalVariables } from "@/globalVariables"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar?: () => void
}

export function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const {user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  // Add state for client-side rendering
  const [mounted, setMounted] = useState(false)

  // Only update the path on the client side after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Don’t render at all until after mount (prevents hydration mismatch)
    return null;
  }

  const isActive = (path: string) => {
    return pathname===path
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out -translate-x-full lg:translate-x-0 hidden",
        isOpen ? "translate-x-0" : "-translate-x-full",
        (pathname === "/" || pathname.startsWith("/student")) ? "block" : "hidden",
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
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="pt-5 pb-4 overflow-y-auto">
        <div className="px-4 mb-6  flex justify-center">
          <div className="inline-flex flex-col items-center ">
            <User className="h-14 w-14 rounded-full bg-gray-200 p-3 text-gray-500" />
            <div className='mt-1'>
              <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className={`mt-1 ${user? 'text-xs':'text-sm' } text-center text-gray-500`}>{GlobalVariables.non_admin.role1}</p>
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
          {user ? <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </Button>: <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            onClick={()=>router.push('/login')}
          >
            <LogIn className="mr-3 h-5 w-5 text-gray-400" />
            Login
          </Button>}
        </div>
      </div>
    </aside>
  )
}
