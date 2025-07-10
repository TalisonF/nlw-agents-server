CREATE TABLE "filesChucks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"type_of_input" text NOT NULL,
	"text" text NOT NULL,
	"embeddings" vector(768) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "audioChunks" CASCADE;--> statement-breakpoint
ALTER TABLE "filesChucks" ADD CONSTRAINT "filesChucks_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;