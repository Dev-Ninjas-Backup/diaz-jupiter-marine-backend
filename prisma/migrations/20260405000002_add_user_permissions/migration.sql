-- Add permissions column to users table
-- SUPER_ADMIN bypasses permission checks entirely; this column is for ADMIN users only.
ALTER TABLE "users" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT '{}';
