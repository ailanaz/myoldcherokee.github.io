#!/bin/zsh
set -euo pipefail

ROOT="/Users/macair/Documents/GitHub/myoldcherokee.github.io"
SNAP_DIR="$ROOT/snapshots"

if [ "${1:-}" = "" ]; then
  echo "Usage: ./tools/site_ops/restore_snapshot.sh <snapshot_folder_name>"
  echo "Available snapshots:"
  ls -1 "$SNAP_DIR" 2>/dev/null || true
  exit 1
fi

SRC="$SNAP_DIR/$1"

if [ ! -d "$SRC" ]; then
  echo "Snapshot not found: $SRC"
  exit 1
fi

# Restore snapshot into repo working tree.
rsync -a --delete \
  --exclude '.git/' \
  --exclude 'snapshots/' \
  "$SRC/" "$ROOT/"

echo "Restored snapshot: $SRC"

