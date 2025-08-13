import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import CourseProviderWrapper from "@/contexts/CourseProviderWrapper";
import LayoutClient from "@/components/layout-client"; // new name

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edu Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CourseProviderWrapper>
            
              <LayoutClient>{children}</LayoutClient>
           
          </CourseProviderWrapper>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
