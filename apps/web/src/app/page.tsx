"use client";

import CTA from "@/components/home/cta";
import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Hero from "@/components/home/hero";
import Navbar from "@/components/home/navbar";
import Pricing from "@/components/home/pricing";
import Testimonials from "@/components/home/testimonials";
import { SignInButton, SignUpButton } from "@clerk/nextjs";



export default function Home() {
	return (
		<>
		<Navbar/>
		<Hero/>
		<Features />
		<Pricing />
		<Testimonials />
		<CTA />
		<Footer />
		</>

	);
}
