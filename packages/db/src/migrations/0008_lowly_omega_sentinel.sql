DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_namespace n ON n.oid = t.typnamespace
		WHERE n.nspname = 'public' AND t.typname = 'subscription_status'
	) AND NOT EXISTS (
		SELECT 1
		FROM pg_type t
		JOIN pg_namespace n ON n.oid = t.typnamespace
		WHERE n.nspname = 'public' AND t.typname = 'billing_status'
	) THEN
		ALTER TYPE "public"."subscription_status" RENAME TO "billing_status";
	END IF;
END $$;