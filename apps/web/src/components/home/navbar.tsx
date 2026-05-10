"use client";

import Link from "next/link";
import Logo from "../logo";
import { ThemeSwitcher } from "../theme-provider";
import { Button } from "../ui/button";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Home, Star, CreditCard, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import posthog from "posthog-js";

const mobileNavItems = [
  { name: "Home", href: "#", icon: Home, id: "hero", scrollToTop: true },
  { name: "Features", href: "#features", icon: Star, id: "features" },
  { name: "Pricing", href: "#pricing", icon: CreditCard, id: "pricing" },
  { name: "Reviews", href: "#testimonials", icon: MessageSquare, id: "testimonials" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = mobileNavItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      {/* Desktop Navbar */}
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={22} className="text-primary" />
              <span className="text-sm font-semibold tracking-tight">QuickCalAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reviews
              </a>
              <div className="w-px h-4 bg-border" />
              <ThemeSwitcher />
              <Show when="signed-out">
                <SignInButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => posthog.capture('sign_in_clicked', { source: 'navbar' })}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                    onClick={() => posthog.capture('sign_up_clicked', { source: 'navbar' })}
                  >
                    Get Started
                  </Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-sm">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </Show>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.scrollToTop) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setActiveSection("hero");
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors rounded-lg px-3 py-1.5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </a>
            );
          })}
        </div>
      </nav>
      {/* Mobile Top Bar */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={18} className="text-primary" />
            <span className="text-sm font-semibold tracking-tight">QuickCalAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Show when="signed-out">
              <SignInButton>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => posthog.capture('sign_in_clicked', { source: 'navbar' })}>
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => posthog.capture('sign_up_clicked', { source: 'navbar' })}>
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
