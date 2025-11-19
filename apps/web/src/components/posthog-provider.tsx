
'use client'

import { useEffect } from "react"

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'always',
      // Performance optimizations
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') console.log('PostHog loaded');
      },
      // Reduce network requests
      capture_pageview: true,
      capture_pageleave: false,
      // Disable some features for better performance
      disable_session_recording: process.env.NODE_ENV === 'production',
      // Reduce polling frequency
      persistence: 'localStorage',
      // Disable some automatic captures
      autocapture: false,
      // Reduce bundle size
      advanced_disable_decide: false,
      // Opt out of beta features
      opt_out_capturing_by_default: false,
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
