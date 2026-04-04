import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { SignUpButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                AI-Powered Scheduling
              </span>
            </div>

            {/* Heading — no gradients, just confident typography */}
            <div className="animate-slide-up">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.08] tracking-tight">
                Image to calendar
                <br />
                in <span className="text-primary">seconds</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed animate-slide-up delay-100 opacity-0">
              Upload a photo of any schedule. Our AI extracts every event and generates
              calendar files you can import anywhere.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-200 opacity-0">
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 h-11 text-sm font-semibold group"
                >
                  Get started free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </SignUpButton>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg px-6 h-11 text-sm font-semibold border-border hover:bg-secondary"
                asChild
              >
                <a href="#how-it-works">How it works</a>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-5 text-sm text-muted-foreground animate-fade-in delay-300 opacity-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                Setup in 30 seconds
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative animate-slide-up delay-200 opacity-0">
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/20">
              <Image
                src="/quickcalai-hero-image.png"
                alt="QuickCalAI Interface - AI-powered calendar extraction from images and PDFs"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                quality={85}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
