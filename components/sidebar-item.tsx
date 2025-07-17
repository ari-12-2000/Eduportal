import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  text: string
  active?: boolean
}

export function SidebarItem({ href, icon: Icon, text, active }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        active ? "bg-blue-100 border-blue-300" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      <Icon className={cn("mr-3 h-5 w-5", active ? "text-blue-500" : "text-gray-400")} />
      {text}
    </Link>
  )
}
