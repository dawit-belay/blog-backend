CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" varchar(5000) NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
