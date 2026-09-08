#!/bin/sh
# ==============================================================================
# BookWorm-API — Environment Configuration Generator
# ==============================================================================
# Automatically generates .env.development files for all microservices from
# their corresponding .env.example templates, tailored for the Docker Compose network.
#
# Usage:
#   sh scripts/generate-env.sh          # Skip existing files
#   sh scripts/generate-env.sh --force  # Overwrite existing files
# ==============================================================================

set -e

# Determine repository root directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

FORCE=false
if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
  FORCE=true
fi

echo "=================================================================="
echo " BookWorm-API: Generating .env.development Configuration Files"
echo "=================================================================="
echo ""

# List of microservice app directories
SERVICES="auth product cart order upload asset mvc"

for SERVICE in $SERVICES; do
  EXAMPLE_FILE="$ROOT_DIR/apps/$SERVICE/.env.example"
  TARGET_FILE="$ROOT_DIR/apps/$SERVICE/.env.development"

  if [ ! -f "$EXAMPLE_FILE" ]; then
    echo "⚠️  Warning: $EXAMPLE_FILE not found, skipping."
    continue
  fi

  if [ -f "$TARGET_FILE" ] && [ "$FORCE" = false ]; then
    echo "ℹ️  Skipped: apps/$SERVICE/.env.development (already exists, use --force to overwrite)"
    continue
  fi

  # Transform localhost service endpoints to Docker Compose network service names
  if [ "$SERVICE" = "mvc" ]; then
    sed \
      -e 's/PRODUCT_SERVICE_HOST_NAME=localhost/PRODUCT_SERVICE_HOST_NAME=product/' \
      -e 's/CART_SERVICE_HOST_NAME=localhost/CART_SERVICE_HOST_NAME=cart/' \
      -e 's/ORDER_SERVICE_HOST_NAME=localhost/ORDER_SERVICE_HOST_NAME=order/' \
      -e 's/ASSET_SERVICE_HOST_NAME=localhost/ASSET_SERVICE_HOST_NAME=asset/' \
      "$EXAMPLE_FILE" > "$TARGET_FILE"
  else
    sed \
      -e 's/SERVICE_HOST_NAME=localhost/SERVICE_HOST_NAME=0.0.0.0/' \
      -e 's/DB_HOST=localhost/DB_HOST=postgres/' \
      -e 's/REDIS_HOST=localhost/REDIS_HOST=redis/' \
      -e 's|RABBIT_MQ_URI=amqp://guest:guest@localhost:5672|RABBIT_MQ_URI=amqp://guest:guest@rabbitmq:5672|' \
      "$EXAMPLE_FILE" > "$TARGET_FILE"
  fi

  echo "✅ Generated: apps/$SERVICE/.env.development"
done

echo ""
echo "=================================================================="
echo " ⚠️  ACTION REQUIRED BEFORE STARTING DOCKER COMPOSE:"
echo "=================================================================="
echo " 1. Open your generated apps/*/.env.development files and fill in"
echo "    the blank fields:"
echo ""
echo "    - apps/auth/.env.development:"
echo "        * DB_USERNAME="
echo "        * DB_PASSWORD="
echo "        * ADMIN_USERNAME="
echo "        * ADMIN_PASSWORD="
echo "        * REDIS_PASSWORD="
echo ""
echo "    - apps/{product,cart,order,asset}/.env.development:"
echo "        * DB_USERNAME="
echo "        * DB_PASSWORD="
echo ""
echo " 2. Once filled, launch the entire platform with:"
echo "        docker compose --profile all up"
echo "=================================================================="
