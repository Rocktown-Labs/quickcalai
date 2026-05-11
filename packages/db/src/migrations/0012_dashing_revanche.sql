ALTER TYPE "public"."upload_status" ADD VALUE 'no_events';--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "workflow_run_id" text;--> statement-breakpoint
ALTER TABLE "uploads" ADD COLUMN "failure_reason" text;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_workflow_run_id_unique" UNIQUE("workflow_run_id");