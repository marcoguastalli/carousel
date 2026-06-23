# syntax=docker/dockerfile:1

# ---- Build stage: compile the static bundle with pnpm ----
FROM node:22-alpine AS build
WORKDIR /app

# Enable the pnpm version pinned in package.json's "packageManager" field
RUN corepack enable

# Install deps first (cached unless the lockfile changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# Build the app -> /app/dist
COPY . .
RUN pnpm build

# ---- Runtime stage: serve the static bundle with nginx ----
FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx:alpine already runs `nginx -g 'daemon off;'` by default
