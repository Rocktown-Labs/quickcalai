import {withSentryConfig} from "@sentry/nextjs";
import { withWorkflow } from 'workflow/next';
import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';
import path from 'node:path';

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	turbopack: {
		root: path.resolve(process.cwd(), '../..'),
	},

	// Performance optimizations
	experimental: {
		optimizeCss: true,
		scrollRestoration: true,
	},

	// Remove console.logs in production
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},



	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},

	// Compression and headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
			{
				source: '/static/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/_next/image(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},

	// Bundle analysis
	webpack: (config, { isServer }) => {
		// Optimize bundle splitting
		if (!isServer) {
			config.optimization.splitChunks.chunks = 'all';
			config.optimization.splitChunks.cacheGroups = {
				...config.optimization.splitChunks.cacheGroups,
				framework: {
					chunks: 'all',
					name: 'framework',
					test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
					priority: 40,
					enforce: true,
				},
				lib: {
					test: /[\\/]node_modules[\\/]/,
					name: 'lib',
					priority: 30,
					chunks: 'all',
				},
			};
		}

		return config;
	},
};

export default withSentryConfig(withWorkflow(withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)), {
 // For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: "rocktown-labs-tq",

 project: "quickcalai-web",

 // Only print logs for uploading source maps in CI
	silent: !process.env.CI,

 // For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

 // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: "/monitoring",

 // Automatically tree-shake Sentry logger statements to reduce bundle size
	disableLogger: true,

 // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
	// See the following for more information:
	// https://docs.sentry.io/product/crons/
	// https://vercel.com/docs/cron-jobs
	automaticVercelMonitors: true,
});
