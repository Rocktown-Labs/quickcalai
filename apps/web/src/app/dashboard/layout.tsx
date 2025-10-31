
import type React from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-qwik-neutral-light">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar className="border-r">
            <SidebarContent>
              <DashboardNav />
            </SidebarContent>
          </Sidebar>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DashboardNav />
        </div>
      </div>
    </SidebarProvider>
  )
}
