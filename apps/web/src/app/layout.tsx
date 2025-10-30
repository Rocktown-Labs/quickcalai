import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {Analytics} from "@vercel/analytics/next";
import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "QuickCalAI - AI-Powered Calendar Extraction",
	description: "Extract dates and events from images and PDFs with AI. Generate calendar files (.ics) and get reminders via download, email, or SMS. Powered by Google Gemini.",
	keywords: ["calendar", "AI", "extraction", "events", "PDF", "image", "Google Gemini", "ICS", "reminders", "ai powered", "sports schedule", "kids calendar", "family calendar", "personal calendar", "work calendar", "business calendar", "professional calendar", "corporate calendar", "enterprise calendar",],
	authors: [{ name: "Rocktown Labs" }],
	creator: "Rocktown Labs",
	publisher: "Rocktown Labs",
	openGraph: {
		title: "QuickCalAI - AI-Powered Calendar Extraction",
		description: "Extract dates and events from images and PDFs with AI. Generate calendar files and get reminders instantly.",
		url: "https://quickcalai.com",
		siteName: "QuickCalAI",
		images: [
			{
				url: "/quickcalai-logo.png",
				width: 1200,
				height: 630,
				alt: "QuickCalAI Logo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "QuickCalAI - AI-Powered Calendar Extraction",
		description: "Extract dates and events from images and PDFs with AI. Generate calendar files and get reminders instantly.",
		images: ["/quickcalai-logo.png"],
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
	metadataBase: new URL("https://quickcalai.com"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
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
