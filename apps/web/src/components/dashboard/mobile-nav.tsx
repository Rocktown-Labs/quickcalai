"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Upload, ImageIcon, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Route } from "next"

const navigation = [
  { name: "Home", href: "/dashboard" as Route, icon: Upload },
  { name: "Media", href: "/dashboard/media" as Route, icon: ImageIcon },
  { name: "Files", href: "/dashboard/files" as Route, icon: FileText },
  { name: "Settings", href: "/dashboard/user-profile" as Route, icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
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
                userButtonTrigger: "focus:shadow-none focus:ring-0"
              }
            }}
          />
          <span className="text-xs font-medium text-muted-foreground truncate">Account</span>
        </div>
      </nav>
    </div>
  )
}