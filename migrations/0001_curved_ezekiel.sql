CREATE TABLE "agendamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"data" text NOT NULL,
	"usuario_id" integer NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;