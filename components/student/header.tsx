"use client"

import type React from "react"

import { useState } from "react"
import { Search, Bell, MessageCircle, Menu, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HeaderProps {
  toggleSidebar: () => void
  toggleChatBot: () => void
}

export function Header({ toggleSidebar, toggleChatBot }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const pathname = usePathname()
  const router = useRouter();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setSearchValue(value)
    if (value.trim()) {
      router.push(`/courses/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <header className={cn("flex bg-white border-b px-4 py-2 items-center justify-between z-30  sticky top-0 shadow-sm", (pathname === "/" || pathname.startsWith("/student")) ? "flex" : "hidden")}>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500 flex xl:hidden"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className={`lg:hidden ${searchOpen ? "hidden" : "block"}`}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
        </div>

        <div className="hidden ml-2 lg:flex items-center xl:hidden">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-800">Eduportal</span>
        </div>
      </div>

      {/* Search bar for md and larger screens */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 h-9 w-full bg-gray-50 border-gray-200"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Expandable search bar for smaller screens */}
        {searchOpen ? (
          <div className="absolute inset-0 flex items-center bg-white px-4 py-2 z-30 sm:hidden">
            <div className="relative w-full flex items-center">

              <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="absolute rounded-full p-2 left-0 top-1/2 -translate-y-1/2 text-gray-500">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-10 h-9 w-full bg-gray-50 border-gray-200"
                autoFocus
                value={searchValue}
                onChange={handleSearchChange}
              />
              <button className="absolute rounded-full right-0 top-1/2 -translate-y-1/2 text-gray-400 p-2">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        )}
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          onClick={toggleChatBot}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to bg-purple-600 text-white hover:text-white rounded-full
           hover:bg-blue-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40
           transition-all duration-300"
        >
          
          <div className="relative w-10 h-10">
            <Image
              src="/images/chatbot.png"
              alt="AI Robot image"
              fill
              className="object-contain"
            />
          </div>
          <p className="font-bold text-lg">Ask</p>

        </Button>
      </div>
    </header>
  )
}
