<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into QuickCalAI. PostHog was already initialized via `instrumentation-client.ts` and `src/lib/posthog-server.ts`, and several events were already in place. This integration added 11 new event capture calls across 7 files, covering the full user journey from marketing site clicks through onboarding, file processing, and premium feature usage. Environment variables were confirmed and updated in `.env.local`. Error tracking via `posthog.captureException()` was added to key user-facing failure paths in the files and settings flows.

| Event | Description | File |
|---|---|---|
| `sign_up_clicked` | User clicks a sign-up/get-started button on the hero section | `src/components/home/hero.tsx` |
| `sign_up_clicked` | User clicks sign-up button in the CTA section | `src/components/home/cta.tsx` |
| `sign_up_clicked` | User clicks sign-up/get-started button from a pricing plan card (with `plan` property) | `src/components/home/pricing.tsx` |
| `sign_up_clicked` | User clicks sign-up button in the navbar (desktop + mobile) | `src/components/home/navbar.tsx` |
| `sign_in_clicked` | User clicks sign-in button in the navbar (desktop + mobile) | `src/components/home/navbar.tsx` |
| `ics_file_downloaded` | User downloads an ICS calendar file from the files gallery | `src/components/dashboard/files-card.tsx` |
| `ics_file_emailed` | Premium user emails an ICS calendar file | `src/components/dashboard/files-card.tsx` |
| `ics_file_sms_sent` | Premium user sends an ICS file download link via SMS | `src/components/dashboard/files-card.tsx` |
| `upgrade_to_premium_clicked` | User clicks upgrade button in the files page upsell banner | `src/components/dashboard/files-gallery.tsx` |
| `upgrade_to_premium_clicked` | User clicks upgrade link from within a file card | `src/components/dashboard/files-card.tsx` |
| `settings_updated` | User successfully saves their profile settings | `src/components/settings/settings-form.tsx` |

**Previously instrumented events** (unchanged): `onboarding_completed`, `media_file_deleted`, `media_file_downloaded`, `file_upload_started`, `file_processing_failed`, `file_processing_completed`, `manual_event_created`, `upgrade_to_premium_clicked` (uploader), `user_created`, `subscription_status_changed`, `file_upload_received`.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1565251)
- [Signup Conversion Funnel](/insights/2qa3VQDi) — tracks drop-off from sign_up_clicked → user_created → onboarding_completed
- [File Processing Pipeline](/insights/L7cozzHx) — funnel from file upload to processing completion
- [Premium Upgrade Clicks by Source](/insights/BkCslsXS) — shows which parts of the app drive the most upgrade intent
- [ICS File Sharing Actions](/insights/DAZbVS9v) — trend of downloads, emails, and SMS shares
- [New Users Over Time](/insights/j0Q9nSAs) — daily new account creation

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
