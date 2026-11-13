CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boarding_house_facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boarding_house_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boarding_house_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boarding_house_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"alt_text" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boarding_houses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"district" text NOT NULL,
	"postal_code" text,
	"latitude" numeric,
	"longitude" numeric,
	"monthly_price" integer NOT NULL,
	"deposit" integer DEFAULT 0,
	"electricity_included" boolean DEFAULT false NOT NULL,
	"water_included" boolean DEFAULT false NOT NULL,
	"gender_policy" text DEFAULT 'mixed' NOT NULL,
	"smoking_policy" text,
	"pet_policy" text,
	"visitor_policy" text,
	"status" text DEFAULT 'published' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"contact_number" text,
	"total_views" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "boarding_houses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "facilities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "room_facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"boarding_house_id" uuid NOT NULL,
	"room_number" text NOT NULL,
	"room_type" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"size" text,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'property_owner' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boarding_house_facilities" ADD CONSTRAINT "boarding_house_facilities_boarding_house_id_boarding_houses_id_fk" FOREIGN KEY ("boarding_house_id") REFERENCES "public"."boarding_houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boarding_house_facilities" ADD CONSTRAINT "boarding_house_facilities_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boarding_house_images" ADD CONSTRAINT "boarding_house_images_boarding_house_id_boarding_houses_id_fk" FOREIGN KEY ("boarding_house_id") REFERENCES "public"."boarding_houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boarding_houses" ADD CONSTRAINT "boarding_houses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_facilities" ADD CONSTRAINT "room_facilities_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_boarding_house_id_boarding_houses_id_fk" FOREIGN KEY ("boarding_house_id") REFERENCES "public"."boarding_houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logs_user_idx" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "logs_created_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "bhf_bh_idx" ON "boarding_house_facilities" USING btree ("boarding_house_id");--> statement-breakpoint
CREATE INDEX "bhf_facility_idx" ON "boarding_house_facilities" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "bhi_bh_idx" ON "boarding_house_images" USING btree ("boarding_house_id");--> statement-breakpoint
CREATE INDEX "bhi_order_idx" ON "boarding_house_images" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "bh_owner_idx" ON "boarding_houses" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "bh_city_idx" ON "boarding_houses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "bh_status_idx" ON "boarding_houses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bh_monthly_price_idx" ON "boarding_houses" USING btree ("monthly_price");--> statement-breakpoint
CREATE INDEX "rf_room_idx" ON "room_facilities" USING btree ("room_id");--> statement-breakpoint
CREATE INDEX "rf_facility_idx" ON "room_facilities" USING btree ("facility_id");--> statement-breakpoint
CREATE INDEX "rooms_bh_idx" ON "rooms" USING btree ("boarding_house_id");--> statement-breakpoint
CREATE INDEX "rooms_status_idx" ON "rooms" USING btree ("status");