
import type React from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex w-full bg-qwik-neutral-light">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardNav />
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
  )
}
