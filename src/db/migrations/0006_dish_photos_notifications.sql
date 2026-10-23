CREATE TABLE "dish_images" (
	"dish_id" uuid PRIMARY KEY NOT NULL,
	"mime" text NOT NULL,
	"data" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "owners" ADD COLUMN "notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "dish_images" ADD CONSTRAINT "dish_images_dish_id_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dishes"("id") ON DELETE cascade ON UPDATE no action;