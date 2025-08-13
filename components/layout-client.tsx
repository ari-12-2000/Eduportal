"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/student/sidebar";
import { Header } from "@/components/student/header";
import { Footer } from "@/components/student/footer";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const isLargeScreen = typeof window !== "undefined" ? window.innerWidth >= 1024 : false;
  const [sidebarOpen, setSidebarOpen] = useState(isLargeScreen);
  const pathname = usePathname()
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className='bg-gray-50 flex'>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={cn("flex-1 flex flex-col", (pathname === "/" || pathname.startsWith("/student")) ? "lg:ml-64" : undefined)}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
