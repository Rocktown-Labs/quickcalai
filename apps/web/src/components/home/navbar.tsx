"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "../theme-provider";
import { Button } from "../ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Home, Star, CreditCard, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePremium } from "@/hooks/use-premium";

const mobileNavItems = [
  { name: "Home", href: "#hero", icon: Home, id: "hero" },
  { name: "Features", href: "#features", icon: Star, id: "features" },
  { name: "Pricing", href: "#pricing", icon: CreditCard, id: "pricing" },
  { name: "Reviews", href: "#testimonials", icon: MessageSquare, id: "testimonials" },
 ];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const { isPremium } = usePremium();

  useEffect(() => {
    const handleScroll = () => {
      const sections = mobileNavItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
      return (
        <header>
          {/* Desktop Navbar */}
          <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                          <Link href="/" className="flex items-center space-x-2">
                            <Image src="/QuickCalAI.png" alt="QuickCalAI Logo" width={32} height={32} className="w-8 h-8 object-contain rounded" />
                            <span className="font-semibold">QuickCalAI</span>
                          </Link>
                        </div>
                       <div className="hidden md:flex items-center space-x-8">
                         <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                           Features
                         </a>
                         <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                           Pricing
                         </a>
                         <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                           Reviews
                         </a>
                         <ThemeSwitcher/>
                         <SignedOut>
                           <SignInButton>
                             <Button
                               variant="outline"
                               className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                             >
                               Sign In
                             </Button>
                           </SignInButton>
                           <SignUpButton>
                             <Button className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow">
                               Get Started
                             </Button>
                           </SignUpButton>
                         </SignedOut>
                         <SignedIn>
                           <UserButton />
                         </SignedIn>
                       </div>
                    </div>
                  </div>
                </nav>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-50">
            <div className="flex items-center justify-around h-16">
              {mobileNavItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                    <span className="text-xs">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </nav>

          {/* Mobile Top Bar */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-md border-b border-border z-50">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center space-x-2">
                  <Image src="/QuickCalAI.png" alt="QuickCalAI Logo" width={24} height={24} className="w-6 h-6 object-contain rounded" />
                  <span className="font-semibold text-sm">QuickCalAI</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeSwitcher />
                <SignInButton>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow">
                    Get Started
                  </Button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </header>
      )
}
