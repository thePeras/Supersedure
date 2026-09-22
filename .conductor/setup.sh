#!/usr/bin/env bash
set -euo pipefail

cd "${CONDUCTOR_WORKSPACE_PATH:-$(dirname "$0")/..}"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm install
  nvm use
fi

echo "node $(node -v) / yarn $(yarn -v)"

yarn install
yarn lib:build
