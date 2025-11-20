ALTER TABLE "subscription_status" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "subscription_status" CASCADE;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "upload_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "ics_url" text;--> statement-breakpoint
DROP TYPE "public"."subscription_status";