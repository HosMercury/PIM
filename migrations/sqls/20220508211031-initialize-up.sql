-- Table: public.users
CREATE TABLE IF NOT EXISTS users
(
  id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1000  ),
  name character varying(50) NOT NULL,
  username character varying(50) NOT NULL UNIQUE,
  password character varying(100) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- session
CREATE TABLE sessions (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_sessions_expire" ON "sessions" ("expire");

-- form control
CREATE TABLE IF NOT EXISTS locals
(
  id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY ,
  name character varying(50) NOT NULL,
  abbreviation character varying(10) NOT NULL,
  direction character varying(5) NOT NULL DEFAULT 'left' check(direction = 'left' OR direction = 'right' ),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- form control
CREATE TABLE IF NOT EXISTS attributes
(
  id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1000 ),
  name character varying(50) NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  validation character varying(50),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
