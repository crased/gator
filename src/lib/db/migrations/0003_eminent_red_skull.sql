ALTER TABLE "feeds" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;