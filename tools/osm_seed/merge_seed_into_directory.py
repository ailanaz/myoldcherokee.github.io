#!/usr/bin/env python3
"""
Merge OSM seed output into assets/data/directory.json without touching featured cards/pages.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple


def norm_name(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s


def norm_phone(s: str) -> str:
    d = re.sub(r"\D+", "", s or "")
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return d


def make_key(r: Dict) -> Tuple[str, str, str]:
    return (
        norm_name(r.get("name", "")),
        (r.get("city") or "").strip().lower(),
        (r.get("state") or "").strip().upper(),
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", default="data/import/osm_seed/all/listings.json")
    ap.add_argument("--directory", default="assets/data/directory.json")
    args = ap.parse_args()

    seed_path = Path(args.seed)
    directory_path = Path(args.directory)

    seed_rows: List[Dict] = json.loads(seed_path.read_text(encoding="utf-8"))
    directory_rows: List[Dict] = json.loads(directory_path.read_text(encoding="utf-8"))

    existing_name_city_state: Set[Tuple[str, str, str]] = set()
    existing_phones: Set[str] = set()
    for r in directory_rows:
        existing_name_city_state.add(make_key(r))
        p = norm_phone(r.get("phone", ""))
        if p:
            existing_phones.add(p)

    added = 0
    for r in seed_rows:
        key = make_key(r)
        phone = norm_phone(r.get("phone", ""))
        if key in existing_name_city_state:
            continue
        if phone and phone in existing_phones:
            continue

        new_row = {
            "name": r.get("name", ""),
            "type": r.get("category", "Repair Shops"),
            "state": r.get("state", ""),
            "city": r.get("city", ""),
            "address": r.get("address", ""),
            "phone": r.get("phone", ""),
            "website": r.get("website", ""),
            "summary": "",
            "categories": r.get("tags", []),
            "source": "OSM",
            "osm_id": r.get("osm_id", ""),
            "business_id": r.get("business_id", ""),
            "google_maps_link": r.get("google_maps_link", ""),
            "lat": r.get("lat"),
            "lon": r.get("lon"),
        }
        directory_rows.append(new_row)
        existing_name_city_state.add(key)
        if phone:
            existing_phones.add(phone)
        added += 1

    directory_rows.sort(key=lambda x: ((x.get("state") or ""), (x.get("type") or ""), (x.get("name") or "").lower()))
    directory_path.write_text(json.dumps(directory_rows, indent=2), encoding="utf-8")
    print(f"merged: added={added}, total={len(directory_rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

