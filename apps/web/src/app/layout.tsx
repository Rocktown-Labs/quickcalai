import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {Analytics} from "@vercel/analytics/next";
import "../index.css";
import Providers from "@/components/providers";

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QuickCalAI",
  "description": "AI-powered calendar extraction tool that converts images and PDFs into calendar events",
  "url": "https://quickcalai.com",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "5.99",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "description": "Monthly subscription for premium AI features"
  },
  "creator": {
    "@type": "Organization",
    "name": "Rocktown Labs",
    "url": "https://quickcalai.com"
  },
  "featureList": [
    "AI-powered calendar extraction",
    "PDF and image processing",
    "ICS file generation",
    "Email and SMS reminders",
    "Calendar integration"
  ],
  "screenshot": "https://quickcalai.com/quickcalai-og.png"
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "QuickCalAI - AI-Powered Calendar Extraction",
		template: "%s | QuickCalAI"
	},
	description: "Extract dates and events from images and PDFs with AI. Generate calendar files (.ics) and get reminders via download, email, or SMS. Powered by Google Gemini.",
	keywords: [
		"calendar extraction",
		"AI calendar",
		"event extraction",
		"PDF to calendar",
		"image to calendar",
		"ICS generator",
		"calendar automation",
		"Google Gemini AI",
		"calendar reminders",
		"event scheduling",
		"sports schedule",
		"family calendar",
		"business calendar",
		"event planning"
	],
	authors: [{ name: "Rocktown Labs" }],
	creator: "Rocktown Labs",
	publisher: "Rocktown Labs",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	alternates: {
		canonical: "/",
	},
	category: "productivity",
	classification: "Software Application",
	openGraph: {
		title: "QuickCalAI - AI-Powered Calendar Extraction",
		description: "Extract dates and events from images and PDFs with AI. Generate calendar files (.ics) and get reminders via download, email, or SMS. Powered by Google Gemini.",
		url: "https://quickcalai.com",
		siteName: "QuickCalAI",
  		images: [
  			{
  				url: "/quickcalai-og.png",
  				width: 1200,
  				height: 630,
  				alt: "QuickCalAI - AI-Powered Calendar Extraction Tool",
  			},
  		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "QuickCalAI - AI-Powered Calendar Extraction",
		description: "Extract dates and events from images and PDFs with AI. Generate calendar files (.ics) and get reminders via download, email, or SMS.",
  		images: ["/quickcalai-og.png"],
		creator: "@rocktownlabs",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-site-verification-code", // Replace with actual code when available
	},
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png", // Add this file if needed
	},
	manifest: "/manifest.json",
	metadataBase: new URL("https://quickcalai.com"),
	other: {
		"application-name": "QuickCalAI",
		"msapplication-TileColor": "#000000",
		"theme-color": "#000000",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers>
					<div className="grid grid-rows-[auto_1fr] h-svh">

						{children}
						<Analytics />
					</div>
				</Providers>
			</body>
		</html>
	);
}
