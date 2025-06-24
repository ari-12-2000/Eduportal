"use client"

import type React from "react"

import { useState } from "react"
import { Search, Bell, MessageSquare, Menu, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const router=useRouter();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value=e.target.value;
    setSearchValue(value)
    if (value.trim()) {
      router.push(`/courses/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <header className="bg-white border-b px-4 py-2 flex items-center justify-between z-20 sticky top-0 shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-gray-500 flex lg:hidden"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className={`md:hidden ${searchOpen ? "hidden" : "block"}`}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
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
              <Search className="h-4 w-4"/>
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
        <Button variant="ghost" size="icon" className="text-gray-500">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
