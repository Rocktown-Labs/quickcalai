ALTER TABLE "users" ADD COLUMN "is_premium_user" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_premium";