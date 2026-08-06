-- packages/backend/prisma/init.sql
-- Initialization SQL for Nexus Messenger Postgres container.
-- Adds useful extensions required by the application and developer tooling.

-- gen_random_uuid provided by pgcrypto is preferred on modern Postgres,
-- pg_trgm enables trigram indexes for fast LIKE/ILIKE/search operations.
-- uuid-ossp is included for compatibility if any code expects uuid_generate_v4().

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
