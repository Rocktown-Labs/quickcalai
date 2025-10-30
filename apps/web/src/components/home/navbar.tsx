import Link from "next/link";
import { ThemeProvider } from "../theme-provider";
import { Button } from "../ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
      return (
        <header>
          <nav className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                      <div className="flex items-center space-x-3">
                        <Link href="/">
                          QuickCalAI
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
                        <ThemeProvider/>
                        <Button
                          variant="outline"
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        >
                          <SignInButton>
Sign In
                          </SignInButton>

                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow">
                          <SignUpButton>
                            Get Started
                          </SignUpButton>
                        </Button>
                      </div>
                    </div>
                  </div>
                </nav>
        </header>
      )
}
