"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Upload, ImageIcon, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { Route } from "next"
import { UserButton, Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ThemeSwitcher } from "../theme-provider"
import { usePremium } from "@/hooks/use-premium"

const navigation = [
  { name: "Home", href: "/dashboard" as Route, icon: Upload },
  { name: "Media", href: "/dashboard/media" as Route, icon: ImageIcon },
  { name: "Files", href: "/dashboard/files" as Route, icon: FileText },
  { name: "Settings", href: "/dashboard/settings" as Route, icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { isPremium } = usePremium()

  // Desktop sidebar navigation
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/QuickCalAI.png" alt="QuickCal Logo" width={32} height={32} className="object-contain rounded" />
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
      {/* User button at bottom */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-center space-x-4">
          <ThemeSwitcher />
          <Show when="signed-out">
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm px-4 py-2 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </div>
  );
}
