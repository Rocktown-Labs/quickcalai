import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "../theme-provider";
import { Button } from "../ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
      return (
        <header>
          <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                       <div className="flex items-center space-x-3">
                         <Link href="/" className="flex items-center space-x-2">
                           <Image src="/quickcalai-logo.png" alt="QuickCalAI Logo" width={32} height={32} className="w-8 h-8" />
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
                       </div>
                    </div>
                  </div>
                </nav>
        </header>
      )
}
