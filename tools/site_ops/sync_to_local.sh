#!/bin/zsh
set -euo pipefail

ROOT="/Users/macair/Documents/GitHub/myoldcherokee.github.io"
LOCAL="/Users/macair/Documents/New project/Site/myoldcherokee-site"

rsync -a --delete --exclude '.git/' "$ROOT/" "$LOCAL/"
echo "Synced repo to local mirror:"
echo "  $ROOT"
echo "  -> $LOCAL"

