# OldXJS Site Project Map

Use this file as the single reference before making edits.

## Primary Working Repo (edit here first)
- `/Users/macair/Documents/GitHub/myoldcherokee.github.io`

## Local Mirror (sync target)
- `/Users/macair/Documents/New project/Site/myoldcherokee-site`

## Key Site Files
- Homepage: `index.html`
- Directory page: `directory.html`
- Featured page: `featured.html`
- Blog index: `blog/index.html`
- State pages: `state/*.html`
- Shared styles: `styles.css`
- Ratings logic: `ratings.js`
- Dynamic state renderer: `assets/js/state-page.js`
- Live directory data: `assets/data/directory.json`

## Safety Rules
- Always create a snapshot before major changes.
- Edit in the GitHub repo copy first.
- Sync to local mirror after changes.
- Commit after each stable checkpoint.

## One-command Helpers
- Create snapshot: `./tools/site_ops/create_snapshot.sh "label"`
- Restore snapshot: `./tools/site_ops/restore_snapshot.sh <snapshot_name>`
- Sync repo -> local: `./tools/site_ops/sync_to_local.sh`

