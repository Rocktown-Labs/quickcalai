"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui/sonner";
import { PostHogProvider } from "./posthog-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				refetchOnWindowFocus: false,
			},
		},
	}));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
	<ClerkProvider>
	<PostHogProvider>
	<QueryProvider>
		{children}
		<Toaster richColors />
	</QueryProvider>
	</PostHogProvider>
	</ClerkProvider>
	);
}
