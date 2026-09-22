#!/usr/bin/env bash
set -euo pipefail

cd "${CONDUCTOR_WORKSPACE_PATH:-$(dirname "$0")/..}"

if ! grep -q '"name": "bks-root"' package.json 2>/dev/null; then
  echo "archive: not a supersedure-studio workspace ($PWD), nothing removed" >&2
  exit 0
fi

rm -rf node_modules apps/studio/node_modules apps/ui-kit/node_modules apps/sqltools/node_modules
rm -rf apps/studio/dist apps/studio/dist_electron apps/ui-kit/dist
rm -rf apps/studio/test-results .instant site .turbo
