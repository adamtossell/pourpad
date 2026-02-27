#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Error: Supabase CLI is not installed or not in PATH." >&2
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "Error: Local Supabase is not running. Start it with: supabase start" >&2
  exit 1
fi

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$ROOT_DIR/backups/supabase-local/$TIMESTAMP"
DB_DIR="$BACKUP_DIR/db"
STORAGE_DIR="$BACKUP_DIR/storage"

mkdir -p "$DB_DIR" "$STORAGE_DIR"

echo "[1/3] Backing up database schema..."
supabase db dump --local --schema public,auth,storage --file "$DB_DIR/schema.sql"

echo "[2/3] Backing up database data..."
supabase db dump --local --data-only --schema public,auth,storage --use-copy --file "$DB_DIR/data.sql"

echo "[3/3] Backing up storage buckets..."
BUCKETS_RAW="$(supabase --experimental storage ls --local ss:/// | sed '/^$/d')"

if [ -z "$BUCKETS_RAW" ]; then
  echo "No storage buckets found."
else
  while IFS= read -r bucket_raw; do
    [ -z "$bucket_raw" ] && continue
    bucket="${bucket_raw#/}"
    bucket="${bucket%/}"
    [ -z "$bucket" ] && continue
    bucket_dest="$STORAGE_DIR/$bucket"
    mkdir -p "$bucket_dest"

    if ! supabase --experimental storage cp --local -r "ss:///$bucket" "$bucket_dest" >/dev/null 2>&1; then
      echo "Warning: could not copy bucket '$bucket' recursively (possibly empty)." >&2
    else
      echo "Copied bucket: $bucket"
    fi
  done <<EOF
$BUCKETS_RAW
EOF
fi

cat > "$BACKUP_DIR/README.txt" <<TXT
Local Supabase backup created at: $TIMESTAMP (UTC)

Contents:
- db/schema.sql   -> database schema dump
- db/data.sql     -> database data dump
- storage/        -> storage bucket files copied locally

Restore database (destructive):
1) supabase db reset --local
2) psql postgresql://postgres:postgres@127.0.0.1:55322/postgres -f db/schema.sql
3) psql postgresql://postgres:postgres@127.0.0.1:55322/postgres -f db/data.sql

Restore storage:
- Re-upload files from storage/<bucket>/ back into ss:///<bucket>/ as needed.
TXT

ln -sfn "$TIMESTAMP" "$ROOT_DIR/backups/supabase-local/latest"

echo "Backup complete: $BACKUP_DIR"
