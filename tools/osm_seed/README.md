# OSM Seed Pipeline

This tool builds a **separate import dataset** for directory growth using OpenStreetMap + Overpass.

It does **not** edit live site pages or existing `assets/data/directory.json`.

## What it outputs

Under `data/import/osm_seed/`:

- `all/listings.json`
- `all/listings.csv`
- `by_state/<state>.json`
- `by_state/<state>.csv`
- `by_category/<category>.json`
- `by_category/<category>.csv`
- `run_manifest.json`

## Included fields

Each listing includes:

- `business_id`
- `name`
- `category`
- `city`
- `state`
- `phone`
- `website`
- `google_maps_link`
- `tags`
- `jeep_note` (optional, signal-based only)
- `source` (`OSM`)
- `osm_id`
- `lat`
- `lon`

## Defaults

- Default states: `FL,CA,AZ,CO,UT,GA,NC,SC,PA,OH`
- Always excluded: `TX,TN`
- For large states (`CA`, `FL`), the script uses metro bounding boxes.
- For others, it uses state boundary areas.

## Run

From repo root:

```bash
python3 tools/osm_seed/osm_seed_pipeline.py
```

Custom example:

```bash
python3 tools/osm_seed/osm_seed_pipeline.py \
  --states FL,CA,AZ,CO,UT,GA,NC,SC,PA,OH,MI,MO,OK,AR,AL \
  --min-total 500 \
  --sleep-seconds 1.5
```

## Pipeline rules implemented

- Category assignment by OSM tags + keyword signals.
- Deduplication by:
  - `osm_id`
  - normalized name + city/state
  - phone
  - distance (<= 200m) + similar name
- Keeps record with best contact info.
- Curation removes obvious low-quality records and non-matches.
- `jeep_note` only added when supported by text signals.

