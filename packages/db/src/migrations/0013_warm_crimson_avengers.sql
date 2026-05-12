ALTER TABLE "uploads" ADD COLUMN "share_token" text;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_share_token_unique" UNIQUE("share_token");