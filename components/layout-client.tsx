"use client";

import { useState } from "react";
import { Sidebar } from "@/components/student/sidebar";
import { Header } from "@/components/student/header";
import { Footer } from "@/components/student/footer";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname()

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className='bg-gray-50 flex'>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={cn("flex-1", (pathname === "/" || pathname.startsWith("/student")) ? "xl:ml-64" :"")}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
