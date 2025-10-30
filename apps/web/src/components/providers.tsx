"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { PostHogProvider } from "./posthog-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
	<ClerkProvider>
	<PostHogProvider>
	<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
			<Toaster richColors />
		</ThemeProvider>
	</PostHogProvider>
	</ClerkProvider>
		);
}
