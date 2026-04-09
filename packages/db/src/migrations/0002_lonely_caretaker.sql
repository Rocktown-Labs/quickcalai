CREATE TYPE "public"."billing_status" AS ENUM('active', 'canceled', 'past_due', 'incomplete', 'ended', 'upcoming', 'free');--> statement-breakpoint
CREATE TABLE "subscription_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"clerk_subscription_id" text,
	"clerk_subscription_item_id" text,
	"plan_id" text,
	"status" "billing_status" NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "ics_url" text;--> statement-breakpoint
ALTER TABLE "subscription_status" ADD CONSTRAINT "subscription_status_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;