CREATE TYPE "public"."group_member_role" AS ENUM('member', 'manager');--> statement-breakpoint
CREATE TYPE "public"."group_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "group_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_by" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "group_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itinerary_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone,
	"location" varchar(180),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"estimated_cost" numeric(10, 2),
	CONSTRAINT "itinerary_items_sort_order_non_negative" CHECK ("itinerary_items"."sort_order" >= 0),
	CONSTRAINT "itinerary_items_estimated_cost_non_negative" CHECK ("itinerary_items"."estimated_cost" is null or "itinerary_items"."estimated_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "packing_item_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"packing_item_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"checked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "packing_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"created_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"image_url" text,
	"owner_id" integer NOT NULL,
	"visibility" "group_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"guests_count" integer DEFAULT 0 NOT NULL,
	"transport_preference" varchar(120),
	"accommodation_preference" varchar(120),
	"note" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trip_participants_guests_count_non_negative" CHECK ("trip_participants"."guests_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"title" varchar(180) NOT NULL,
	"description" text,
	"destination" varchar(180) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"meeting_point" text,
	"capacity" integer,
	"estimated_budget" numeric(10, 2),
	"canceled" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trips_capacity_positive" CHECK ("trips"."capacity" is null or "trips"."capacity" > 0),
	CONSTRAINT "trips_dates_valid" CHECK ("trips"."end_date" >= "trips"."start_date"),
	CONSTRAINT "trips_estimated_budget_non_negative" CHECK ("trips"."estimated_budget" is null or "trips"."estimated_budget" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "group_invites" ADD CONSTRAINT "group_invites_group_id_travel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."travel_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_invites" ADD CONSTRAINT "group_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_travel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."travel_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_item_checks" ADD CONSTRAINT "packing_item_checks_packing_item_id_packing_items_id_fk" FOREIGN KEY ("packing_item_id") REFERENCES "public"."packing_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_item_checks" ADD CONSTRAINT "packing_item_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packing_items" ADD CONSTRAINT "packing_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_groups" ADD CONSTRAINT "travel_groups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_comments" ADD CONSTRAINT "trip_comments_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_comments" ADD CONSTRAINT "trip_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_participants" ADD CONSTRAINT "trip_participants_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_participants" ADD CONSTRAINT "trip_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_group_id_travel_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."travel_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_invites_token_unique" ON "group_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX "group_invites_group_id_idx" ON "group_invites" USING btree ("group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_group_id_user_id_unique" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "group_members_user_id_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "itinerary_items_trip_id_idx" ON "itinerary_items" USING btree ("trip_id");--> statement-breakpoint
CREATE UNIQUE INDEX "packing_item_checks_item_id_user_id_unique" ON "packing_item_checks" USING btree ("packing_item_id","user_id");--> statement-breakpoint
CREATE INDEX "packing_item_checks_user_id_idx" ON "packing_item_checks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "packing_items_trip_id_idx" ON "packing_items" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "packing_items_created_by_idx" ON "packing_items" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "travel_groups_owner_id_idx" ON "travel_groups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "travel_groups_visibility_idx" ON "travel_groups" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "trip_comments_trip_id_idx" ON "trip_comments" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "trip_comments_user_id_idx" ON "trip_comments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trip_participants_trip_id_user_id_unique" ON "trip_participants" USING btree ("trip_id","user_id");--> statement-breakpoint
CREATE INDEX "trip_participants_user_id_idx" ON "trip_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trips_group_id_idx" ON "trips" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "trips_created_by_idx" ON "trips" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");