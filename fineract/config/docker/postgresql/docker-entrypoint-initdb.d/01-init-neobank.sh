#!/bin/bash
set -e
export PGPASSWORD=$POSTGRES_PASSWORD;
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER postgres WITH PASSWORD 'neobank_db_secret_2026' SUPERUSER;
  CREATE DATABASE fineract_tenants;
  CREATE DATABASE fineract_default;
  GRANT ALL PRIVILEGES ON DATABASE fineract_tenants TO postgres;
  GRANT ALL PRIVILEGES ON DATABASE fineract_default TO postgres;
  \c fineract_tenants
  GRANT ALL ON SCHEMA public TO postgres;
  \c fineract_default
  GRANT ALL ON SCHEMA public TO postgres;
EOSQL
