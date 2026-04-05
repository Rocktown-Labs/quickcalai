"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

export default function CTA() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 cta-bg" />

      <div className="relative z-10 max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-white mb-3">
          Ready to transform your scheduling?
        </h2>
        <p className="text-base text-white/50 mb-8 max-w-md mx-auto">
          Join hundreds of professionals who&apos;ve already streamlined their calendar management.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignUpButton>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 text-sm font-semibold group"
            >
              Get started free
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </SignUpButton>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-sm font-semibold border-white/20 text-white hover:bg-white/5 bg-transparent"
            asChild
          >
            <a href="#pricing">View pricing</a>
          </Button>
        </div>
        <p className="text-white/30 text-xs mt-5">
          Free to start &middot; No credit card required &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}
