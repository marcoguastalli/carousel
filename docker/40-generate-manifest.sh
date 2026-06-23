#!/bin/sh
# Runtime manifest generator for the <image-carousel> app.
#
# Images are NOT baked into the image; they are mounted as a volume at
# /usr/share/nginx/html/images. This script (run by nginx's entrypoint via
# /docker-entrypoint.d/ on every container start) scans that folder recursively
# and writes a manifest the carousel can fetch. It writes OUTSIDE the mounted
# folder so the volume can be mounted read-only and stays free of build cruft.
set -eu

IMAGES_DIR=/usr/share/nginx/html/images
OUT=/var/lib/carousel/manifest.json

mkdir -p "$(dirname "$OUT")"

if [ -d "$IMAGES_DIR" ]; then
  list=$(cd "$IMAGES_DIR" && find . -type f \
    \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \
       -o -iname '*.gif' -o -iname '*.webp' \) \
    | sed 's|^\./||' | LC_ALL=C sort)
else
  list=""
fi

# Emit a JSON array of paths relative to IMAGES_DIR (forward slashes),
# escaping backslashes and double quotes.
{
  printf '['
  printf '%s\n' "$list" | awk 'NF {
    gsub(/\\/, "\\\\"); gsub(/"/, "\\\"");
    printf "%s\"%s\"", sep, $0; sep=","
  }'
  printf ']'
} > "$OUT"

count=$(printf '%s\n' "$list" | grep -c . || true)
echo "carousel: generated manifest with ${count} image(s) from ${IMAGES_DIR}"
