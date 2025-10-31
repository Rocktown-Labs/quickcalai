
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Upload, ImageIcon, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Route } from "next"

const navigation = [
  { name: "Home", href: "/dashboard" as Route, icon: Upload },
  { name: "Media", href: "/dashboard/media" as Route, icon: ImageIcon },
  { name: "Files", href: "/dashboard/files" as Route, icon: FileText },
  { name: "Settings", href: "/dashboard/user-profile" as Route, icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className={cn("w-5 h-5 mb-1", isActive && "scale-110")} />
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            )
          })}
          {/* Clerk User Button for mobile */}
          <div className="flex flex-col items-center justify-center p-2 min-w-0 flex-1">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-5 h-5 mb-1",
                  userButtonTrigger: "focus:shadow-none focus:ring-0 p-0"
                }
              }}
            />
            <span className="text-xs font-medium text-muted-foreground truncate">Account</span>
          </div>
        </nav>
      </div>
    )
  }

  // Desktop sidebar navigation
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/quickcalai-logo.png" alt="QuickCal Logo" width={32} height={32} className="rounded" />
          <span className="font-serif font-bold text-xl text-foreground">QuickCalAI</span>
        </Link>
      </div>

      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Clerk User Button for desktop */}
      <div className="p-6 border-t border-border">
        <div className="flex justify-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonTrigger: "focus:shadow-none focus:ring-0"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
