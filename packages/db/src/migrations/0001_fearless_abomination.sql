ALTER TABLE "users" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_onboarded" boolean DEFAULT false NOT NULL;