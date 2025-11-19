"use client";

import dynamic from "next/dynamic";

// Critical components - load immediately
import Hero from "@/components/home/hero";
import Navbar from "@/components/home/navbar";

// Non-critical components - lazy load with loading states
const Features = dynamic(() => import("@/components/home/features"), {
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const Pricing = dynamic(() => import("@/components/home/pricing"), {
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const Testimonials = dynamic(() => import("@/components/home/testimonials"), {
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const CTA = dynamic(() => import("@/components/home/cta"), {
  loading: () => (
    <div className="min-h-[30vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

const Footer = dynamic(() => import("@/components/home/footer"));



export default function Home() {
	return (
		<div className="pb-16 md:pb-0">
		<Navbar/>
		<Hero/>
		<Features />
		<Pricing />
		<Testimonials />
		<CTA />
		<Footer />
		</div>

	);
}
