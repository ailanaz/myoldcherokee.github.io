# Site Ops Scripts

These scripts reduce accidental overwrites and make rollback/sync steps repeatable.

## 1) Create snapshot
```bash
./tools/site_ops/create_snapshot.sh "before-big-change"
```

Creates a full content snapshot in `snapshots/<timestamp>-before-big-change/`.

## 2) Restore snapshot
```bash
./tools/site_ops/restore_snapshot.sh <snapshot_folder_name>
```

Restores that snapshot into the repo working tree.

## 3) Sync repo -> local mirror
```bash
./tools/site_ops/sync_to_local.sh
```

Pushes current repo content to:
- `/Users/macair/Documents/New project/Site/myoldcherokee-site`

## Recommended Flow
1. Create snapshot
2. Make edits
3. Verify pages
4. Commit
5. Sync to local mirror

