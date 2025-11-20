# QuickCalAI

AI-powered calendar extraction tool that transforms images and PDFs into calendar events. Upload your documents, let AI extract dates and times, and get organized with downloadable .ics files, email reminders, or SMS notifications.

Built by [Rocktown Labs](https://rocktownlabs.com).

## Features

- **AI-Powered Extraction** - Uses Google Gemini to intelligently extract dates, times, and events from images and PDFs
- **Multiple Output Formats** - Generate .ics calendar files for easy import into any calendar application
- **Flexible Delivery** - Download files directly, receive via email (Resend), or get SMS reminders (Twilio)
- **Cross-Platform** - Web application with React Native mobile app
- **Secure Authentication** - User management powered by Clerk
- **Modern Tech Stack** - Built with Next.js, React Native, TypeScript, and PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rocktownlabs/quickcalai.git
cd quickcalai
```

2. Install dependencies:
```bash
pnpm install
```

### Database Setup

1. Set up a PostgreSQL database
2. Configure environment variables in `apps/web/.env`:
```env
AI_GATEWAY_API_KEY=
BLOB_READ_WRITE_TOKEN=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
RESEND_API_KEY=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
VERCEL_OIDC_TOKEN=
```

3. Push the database schema:
```bash
pnpm db:push
```

### Development

Start the development servers:

```bash
pnpm dev          # Start both web and native apps
pnpm dev:web      # Start only the web app
pnpm dev:native   # Start only the native app
```

Open [http://localhost:3001](http://localhost:3001) to view the web application.
Use the Expo Go app to run the mobile application.







## Project Structure

```
quickcalai/
├── apps/
│   ├── web/         # Next.js web application
│   └── native/      # React Native mobile application (Expo)
├── packages/
│   └── db/          # Shared database package with Drizzle ORM
```

## Available Scripts

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications for production
- `pnpm check-types` - Run TypeScript type checking across all apps
- `pnpm dev:web` - Start the Next.js web application
- `pnpm dev:native` - Start the React Native/Expo development server
- `pnpm db:push` - Push database schema changes
- `pnpm db:generate` - Generate database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:migrate` - Run database migrations
- `pnpm test` - Run unit tests in watch mode
- `pnpm test:run` - Run unit tests once
- `pnpm test:coverage` - Run unit tests with coverage report
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run end-to-end tests with UI

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Mobile**: React Native, Expo
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI**: Google Gemini via Vercel AI SDK
- **File Storage**: Vercel Blob
- **Email**: Resend
- **SMS**: Twilio
- **Build System**: Turborepo

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@rocktownlabs.com or join our Discord community.
