"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui/sonner";
import { PostHogProvider } from "./posthog-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
	<ClerkProvider>
	<PostHogProvider>
		{children}
		<Toaster richColors />
	</PostHogProvider>
	</ClerkProvider>
		);
}
