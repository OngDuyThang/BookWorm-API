-- ==============================================================================
-- BookWorm-API Database Initialization Script
-- Automatically executed on first boot by PostgreSQL official container
-- ==============================================================================

SELECT 'CREATE DATABASE bookworm_auth' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookworm_auth')\gexec
SELECT 'CREATE DATABASE bookworm_product' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookworm_product')\gexec
SELECT 'CREATE DATABASE bookworm_cart' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookworm_cart')\gexec
SELECT 'CREATE DATABASE bookworm_order' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookworm_order')\gexec
SELECT 'CREATE DATABASE bookworm_asset' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookworm_asset')\gexec
