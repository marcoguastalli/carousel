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

# nginx serves the manifest from a generated file, not the baked placeholder
COPY docker/default.conf /etc/nginx/conf.d/default.conf
# Regenerates /images/manifest.json from the mounted volume on every start
COPY docker/40-generate-manifest.sh /docker-entrypoint.d/40-generate-manifest.sh
RUN chmod +x /docker-entrypoint.d/40-generate-manifest.sh

# Images are content, not code: mount them here at runtime, e.g.
#   docker run -p 8080:80 -v "$PWD/public/images:/usr/share/nginx/html/images:ro" <image>
VOLUME ["/usr/share/nginx/html/images"]

EXPOSE 80
# nginx:alpine already runs its entrypoint (which executes /docker-entrypoint.d/*)
# and then `nginx -g 'daemon off;'` by default.
