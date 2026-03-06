#!/bin/zsh
set -euo pipefail

ROOT="/Users/macair/Documents/GitHub/myoldcherokee.github.io"
SNAP_DIR="$ROOT/snapshots"
STAMP="$(date +%Y%m%d-%H%M%S)"
LABEL="${1:-manual}"
NAME="${STAMP}-${LABEL}"
OUT="$SNAP_DIR/$NAME"

mkdir -p "$OUT"

# Snapshot site content, excluding git internals and snapshots themselves.
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'snapshots/' \
  "$ROOT/" "$OUT/"

echo "Snapshot created: $OUT"

