CREATE TABLE "alteracoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" text NOT NULL,
	"dados" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cargas" (
	"id" serial PRIMARY KEY NOT NULL,
	"hora" text NOT NULL,
	"viagem" text NOT NULL,
	"frota" text NOT NULL,
	"prebox" text NOT NULL,
	"boxd" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
