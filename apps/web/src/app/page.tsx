"use client";

import dynamic from "next/dynamic";

// Critical components - load immediately
import Hero from "@/components/home/hero";
import Navbar from "@/components/home/navbar";

// Non-critical components - lazy load
const Stats = dynamic(() => import("@/components/home/stats"));

const HowItWorks = dynamic(() => import("@/components/home/how-it-works"));

const Features = dynamic(() => import("@/components/home/features"));

const Pricing = dynamic(() => import("@/components/home/pricing"));

const Testimonials = dynamic(() => import("@/components/home/testimonials"));

const CTA = dynamic(() => import("@/components/home/cta"));

const Footer = dynamic(() => import("@/components/home/footer"));

export default function Home() {
  return (
    <div className="pb-16 md:pb-0">
      <Navbar />
      <Hero />
      <Stats />
      <div className="section-divider" />
      <HowItWorks />
      <div className="section-divider" />
      <Features />
      <div className="section-divider" />
      <Pricing />
      <div className="section-divider" />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
