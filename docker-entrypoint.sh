#!/bin/sh
set -eu

# Railway injects PORT; LibreTranslate expects LT_PORT.
if [ -n "${PORT:-}" ]; then
  export LT_PORT="$PORT"
fi

export LT_PORT="${LT_PORT:-5000}"
export LT_HOST="${LT_HOST:-0.0.0.0}"

exec /app/scripts/entrypoint.sh "$@"
