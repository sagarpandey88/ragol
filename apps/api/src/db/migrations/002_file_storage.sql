-- Store file content in Postgres instead of on disk

ALTER TABLE documents
  ADD COLUMN file_data BYTEA NOT NULL DEFAULT '\x'::BYTEA,
  ALTER COLUMN file_path DROP NOT NULL;

-- Drop the placeholder default; new rows must supply file_data explicitly
ALTER TABLE documents ALTER COLUMN file_data DROP DEFAULT;
