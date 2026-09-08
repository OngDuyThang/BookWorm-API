# ==============================================================================
# Admin MVC Dashboard Dockerfile (Multi-Stage Build)
# ==============================================================================
# Build command (from monorepo root):
#   docker build -f apps/mvc/Dockerfile -t bookworm-mvc:latest .
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Stage: Minimal Node.js 20 Alpine
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# ------------------------------------------------------------------------------
# 2. Dependencies Stage: Full dependencies for building
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# 3. Development Stage: For local development with live reload & volume mounts
# ------------------------------------------------------------------------------
FROM base AS development
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 8081
CMD ["npm", "run", "dev", "mvc"]

# ------------------------------------------------------------------------------
# 4. Builder Stage: Compile TypeScript and copy Handlebars views & SVG assets
# ------------------------------------------------------------------------------
FROM base AS builder
COPY package.json package-lock.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY libs ./libs
COPY apps/mvc ./apps/mvc
RUN npx nest build mvc

# ------------------------------------------------------------------------------
# 5. Production Dependencies Stage: Strip devDependencies
# ------------------------------------------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ------------------------------------------------------------------------------
# 6. Production Runtime Stage: Minimal attack surface, non-root user
# ------------------------------------------------------------------------------
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=8081

WORKDIR /usr/src/app

# Install dumb-init for proper signal handling and zombie process reaping
RUN apk add --no-cache dumb-init

# Use non-root node user provided by alpine
USER node

# Copy production dependencies and compiled service output (including views & public assets)
COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist/apps/mvc ./dist/apps/mvc

EXPOSE 8081

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/mvc/main"]
