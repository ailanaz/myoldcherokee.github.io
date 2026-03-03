#!/usr/bin/env python3
"""
OSM/Overpass directory seeding pipeline.

Creates import-ready JSON/CSV files by state and category for free listings.
This script is intentionally standalone and does not mutate live site data.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, List, Optional, Tuple


DEFAULT_STATES = ["FL", "CA", "AZ", "CO", "UT", "GA", "NC", "SC", "PA", "OH"]
EXCLUDED_STATES = {"TX", "TN"}

# Metro bboxes for very large states (south,west,north,east)
LARGE_STATE_BBOXES: Dict[str, List[Tuple[float, float, float, float]]] = {
    "CA": [
        (33.5, -118.9, 34.4, -117.5),   # Los Angeles basin
        (37.1, -122.7, 38.1, -121.7),   # SF Bay / East Bay
        (32.5, -117.4, 33.2, -116.6),   # San Diego
        (36.5, -121.0, 37.6, -119.4),   # Fresno / Central Valley
        (38.2, -122.8, 39.0, -121.0),   # Sacramento
    ],
    "FL": [
        (25.3, -80.6, 26.5, -79.8),     # Miami / Fort Lauderdale
        (27.5, -82.8, 28.3, -82.1),     # Tampa / St. Pete
        (28.2, -81.7, 28.8, -81.0),     # Orlando
        (29.9, -81.9, 30.6, -81.3),     # Jacksonville
        (26.0, -82.2, 26.8, -81.6),     # Fort Myers / Naples
    ],
}


def slugify(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "listing"


def norm_name(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"[^a-z0-9\s]", "", s)
    s = re.sub(r"\b(llc|inc|co|company|auto|automotive|shop|services)\b", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def norm_phone(s: str) -> str:
    if not s:
        return ""
    d = re.sub(r"\D+", "", s)
    if len(d) == 11 and d.startswith("1"):
        d = d[1:]
    return d


def haversine_km(a_lat: float, a_lon: float, b_lat: float, b_lon: float) -> float:
    r = 6371.0
    dlat = math.radians(b_lat - a_lat)
    dlon = math.radians(b_lon - a_lon)
    x = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(x))


def similar_name(a: str, b: str) -> bool:
    return SequenceMatcher(None, norm_name(a), norm_name(b)).ratio() >= 0.88


def best_tag(tags: Dict[str, str], *keys: str) -> str:
    for k in keys:
        v = tags.get(k, "")
        if v:
            return str(v).strip()
    return ""


FOUR_BY_FOUR = re.compile(r"\b(4x4|4wd|off[- ]?road|trail|lift|rock crawler)\b", re.I)
JEEP_WORD = re.compile(r"\bjeep|xj\b", re.I)
FAB_WORD = re.compile(r"\b(fab|fabrication|weld|welding|bumper|cage)\b", re.I)
SUSP_WORD = re.compile(r"\b(lift|suspension|alignment|leveling|level kit)\b", re.I)
DRIVE_WORD = re.compile(r"\b(driveshaft|differential|diff|gear|gears|axle|transfer case)\b", re.I)
RUST_WORD = re.compile(r"\b(rust|metal|restoration|bodywork|panel)\b", re.I)
ELEC_WORD = re.compile(r"\b(electrical|diagnostic|diagnostics|wiring)\b", re.I)
COOL_WORD = re.compile(r"\b(radiator|cooling|overheat|overheating)\b", re.I)
GLASS_WORD = re.compile(r"\b(auto glass|windshield|windscreen)\b", re.I)
SALVAGE_WORD = re.compile(r"\b(salvage|junk|scrap|wrecking|yard)\b", re.I)
AUTO_WORD = re.compile(r"\b(auto|car|vehicle|truck|4x4|jeep)\b", re.I)


@dataclass(frozen=True)
class Category:
    label: str
    base_tags: Tuple[str, ...]


CATEGORIES = {
    "repair": Category("Repair Shops (XJ/Jeep-Friendly)", ("repair", "mechanic")),
    "fab": Category("Fabrication and Welding (4x4)", ("fabrication", "welding", "4x4")),
    "suspension": Category("Suspension, Alignment, and Lift Install", ("suspension", "alignment", "lift")),
    "drivetrain": Category("Drivetrain Specialists (Axles, Gears, Driveshafts)", ("drivetrain", "axle", "gears")),
    "rust": Category("Rust Repair and Body (Welding Focus)", ("rust-repair", "bodywork", "welding")),
    "parts": Category("Parts Shops and 4x4 Retailers", ("parts", "retail")),
    "salvage": Category("Salvage Yards and Junkyards (Used Jeep Parts)", ("salvage", "junkyard", "used-parts")),
    "electrical": Category("Electrical and Diagnostics (Older Vehicle Friendly)", ("electrical", "diagnostics")),
    "cooling": Category("Radiator and Cooling Specialists", ("radiator", "cooling")),
    "glass": Category("Auto Glass and Windshield", ("auto-glass", "windshield")),
    "upholstery": Category("Upholstery and Interior (Headliners, Seats)", ("upholstery", "interior")),
    "towing": Category("Towing and Recovery (4x4 capable)", ("towing", "recovery")),
}


def choose_category(tags: Dict[str, str], text: str) -> Optional[str]:
    shop = tags.get("shop", "")
    craft = tags.get("craft", "")
    amenity = tags.get("amenity", "")
    industrial = tags.get("industrial", "")

    if amenity == "scrapyard" or industrial == "scrap_yard":
        return CATEGORIES["salvage"].label
    if amenity == "towing":
        return CATEGORIES["towing"].label
    if craft == "upholsterer" or (shop == "upholstery" and AUTO_WORD.search(text)):
        return CATEGORIES["upholstery"].label
    if shop == "car_parts" or (shop == "car_accessories" and FOUR_BY_FOUR.search(text)):
        return CATEGORIES["parts"].label
    if craft == "welder":
        return CATEGORIES["fab"].label
    if shop == "glass" and GLASS_WORD.search(text):
        return CATEGORIES["glass"].label
    if shop == "car_bodywork" and (RUST_WORD.search(text) or FAB_WORD.search(text)):
        return CATEGORIES["rust"].label
    if shop == "car_repair":
        if GLASS_WORD.search(text):
            return CATEGORIES["glass"].label
        if COOL_WORD.search(text):
            return CATEGORIES["cooling"].label
        if ELEC_WORD.search(text):
            return CATEGORIES["electrical"].label
        if DRIVE_WORD.search(text):
            return CATEGORIES["drivetrain"].label
        if SUSP_WORD.search(text):
            return CATEGORIES["suspension"].label
        if RUST_WORD.search(text):
            return CATEGORIES["rust"].label
        if FAB_WORD.search(text):
            return CATEGORIES["fab"].label
        return CATEGORIES["repair"].label
    if shop == "tyres" and SUSP_WORD.search(text):
        return CATEGORIES["suspension"].label
    return None


def infer_jeep_note(text: str) -> str:
    if FOUR_BY_FOUR.search(text):
        return "4x4 focused"
    if JEEP_WORD.search(text):
        return "Jeep mentioned"
    if re.search(r"\boff[- ]?road\b", text, re.I):
        return "Off-road shop"
    if re.search(r"\blift|suspension\b", text, re.I):
        return "Lift installs"
    if re.search(r"\btrail|crawler\b", text, re.I):
        return "Trail builds"
    return ""


def tags_for(category_label: str, text: str) -> List[str]:
    base: List[str] = []
    for c in CATEGORIES.values():
        if c.label == category_label:
            base.extend(c.base_tags)
            break
    if JEEP_WORD.search(text):
        base.append("jeep")
    if FOUR_BY_FOUR.search(text):
        base.append("4x4")
    if FAB_WORD.search(text):
        base.append("welding")
    if SALVAGE_WORD.search(text):
        base.append("salvage")
    out: List[str] = []
    seen = set()
    for t in base:
        if t not in seen:
            out.append(t)
            seen.add(t)
    return out


def overpass_query_for_area(state_code: str) -> str:
    return f"""
[out:json][timeout:180];
area["ISO3166-2"="US-{state_code}"][admin_level=4]->.stateArea;
(
  node["shop"="car_repair"](area.stateArea); way["shop"="car_repair"](area.stateArea); relation["shop"="car_repair"](area.stateArea);
  node["shop"="car_parts"](area.stateArea); way["shop"="car_parts"](area.stateArea); relation["shop"="car_parts"](area.stateArea);
  node["shop"="car_accessories"](area.stateArea); way["shop"="car_accessories"](area.stateArea); relation["shop"="car_accessories"](area.stateArea);
  node["craft"="welder"](area.stateArea); way["craft"="welder"](area.stateArea); relation["craft"="welder"](area.stateArea);
  node["craft"="upholsterer"](area.stateArea); way["craft"="upholsterer"](area.stateArea); relation["craft"="upholsterer"](area.stateArea);
  node["amenity"="scrapyard"](area.stateArea); way["amenity"="scrapyard"](area.stateArea); relation["amenity"="scrapyard"](area.stateArea);
  node["industrial"="scrap_yard"](area.stateArea); way["industrial"="scrap_yard"](area.stateArea); relation["industrial"="scrap_yard"](area.stateArea);
  node["amenity"="towing"](area.stateArea); way["amenity"="towing"](area.stateArea); relation["amenity"="towing"](area.stateArea);
  node["shop"="car_bodywork"](area.stateArea); way["shop"="car_bodywork"](area.stateArea); relation["shop"="car_bodywork"](area.stateArea);
  node["shop"="glass"](area.stateArea); way["shop"="glass"](area.stateArea); relation["shop"="glass"](area.stateArea);
  node["shop"="upholstery"](area.stateArea); way["shop"="upholstery"](area.stateArea); relation["shop"="upholstery"](area.stateArea);
  node["shop"="tyres"](area.stateArea); way["shop"="tyres"](area.stateArea); relation["shop"="tyres"](area.stateArea);
);
out center tags;
""".strip()


def overpass_query_for_bbox(bbox: Tuple[float, float, float, float]) -> str:
    s, w, n, e = bbox
    return f"""
[out:json][timeout:180];
(
  node["shop"="car_repair"]({s},{w},{n},{e}); way["shop"="car_repair"]({s},{w},{n},{e}); relation["shop"="car_repair"]({s},{w},{n},{e});
  node["shop"="car_parts"]({s},{w},{n},{e}); way["shop"="car_parts"]({s},{w},{n},{e}); relation["shop"="car_parts"]({s},{w},{n},{e});
  node["shop"="car_accessories"]({s},{w},{n},{e}); way["shop"="car_accessories"]({s},{w},{n},{e}); relation["shop"="car_accessories"]({s},{w},{n},{e});
  node["craft"="welder"]({s},{w},{n},{e}); way["craft"="welder"]({s},{w},{n},{e}); relation["craft"="welder"]({s},{w},{n},{e});
  node["craft"="upholsterer"]({s},{w},{n},{e}); way["craft"="upholsterer"]({s},{w},{n},{e}); relation["craft"="upholsterer"]({s},{w},{n},{e});
  node["amenity"="scrapyard"]({s},{w},{n},{e}); way["amenity"="scrapyard"]({s},{w},{n},{e}); relation["amenity"="scrapyard"]({s},{w},{n},{e});
  node["industrial"="scrap_yard"]({s},{w},{n},{e}); way["industrial"="scrap_yard"]({s},{w},{n},{e}); relation["industrial"="scrap_yard"]({s},{w},{n},{e});
  node["amenity"="towing"]({s},{w},{n},{e}); way["amenity"="towing"]({s},{w},{n},{e}); relation["amenity"="towing"]({s},{w},{n},{e});
  node["shop"="car_bodywork"]({s},{w},{n},{e}); way["shop"="car_bodywork"]({s},{w},{n},{e}); relation["shop"="car_bodywork"]({s},{w},{n},{e});
  node["shop"="glass"]({s},{w},{n},{e}); way["shop"="glass"]({s},{w},{n},{e}); relation["shop"="glass"]({s},{w},{n},{e});
  node["shop"="upholstery"]({s},{w},{n},{e}); way["shop"="upholstery"]({s},{w},{n},{e}); relation["shop"="upholstery"]({s},{w},{n},{e});
  node["shop"="tyres"]({s},{w},{n},{e}); way["shop"="tyres"]({s},{w},{n},{e}); relation["shop"="tyres"]({s},{w},{n},{e});
);
out center tags;
""".strip()


def overpass_fetch(overpass_url: str, query: str) -> Dict:
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    req = urllib.request.Request(overpass_url, data=data, headers={"User-Agent": "oldxjs-osm-seed/1.0"})
    with urllib.request.urlopen(req, timeout=240) as resp:
        return json.loads(resp.read().decode("utf-8"))


def quality_score(rec: Dict) -> int:
    score = 0
    if rec.get("phone"):
        score += 3
    if rec.get("website"):
        score += 3
    if rec.get("city"):
        score += 1
    if rec.get("name"):
        score += 1
    if rec.get("jeep_note"):
        score += 1
    return score


def merge_records(best: Dict, candidate: Dict) -> Dict:
    out = dict(best)
    for key in ("phone", "website", "city", "google_maps_link", "jeep_note"):
        if not out.get(key) and candidate.get(key):
            out[key] = candidate[key]
    out["tags"] = list(dict.fromkeys((out.get("tags") or []) + (candidate.get("tags") or [])))
    return out


def dedupe(records: List[Dict]) -> List[Dict]:
    by_quality = sorted(records, key=quality_score, reverse=True)
    kept: List[Dict] = []
    by_osm: Dict[str, int] = {}
    by_phone: Dict[str, int] = {}
    by_name_city: Dict[Tuple[str, str, str], int] = {}
    by_state_indexes: Dict[str, List[int]] = defaultdict(list)

    for rec in by_quality:
        key_osm = rec.get("osm_id", "")
        key_phone = norm_phone(rec.get("phone", ""))
        key_name_city = (norm_name(rec.get("name", "")), rec.get("city", "").lower(), rec.get("state", ""))
        match_idx = None

        if key_osm and key_osm in by_osm:
            match_idx = by_osm[key_osm]
        elif key_phone and key_phone in by_phone:
            match_idx = by_phone[key_phone]
        elif key_name_city[0] and key_name_city in by_name_city:
            match_idx = by_name_city[key_name_city]
        else:
            for idx in by_state_indexes.get(rec["state"], []):
                other = kept[idx]
                if similar_name(rec["name"], other["name"]):
                    if haversine_km(rec["lat"], rec["lon"], other["lat"], other["lon"]) <= 0.2:
                        match_idx = idx
                        break

        if match_idx is None:
            kept.append(rec)
            idx = len(kept) - 1
        else:
            idx = match_idx
            kept[idx] = merge_records(kept[idx], rec)

        by_osm[kept[idx].get("osm_id", "")] = idx
        p = norm_phone(kept[idx].get("phone", ""))
        if p:
            by_phone[p] = idx
        nk = (norm_name(kept[idx].get("name", "")), kept[idx].get("city", "").lower(), kept[idx].get("state", ""))
        if nk[0]:
            by_name_city[nk] = idx
        if idx not in by_state_indexes[kept[idx]["state"]]:
            by_state_indexes[kept[idx]["state"]].append(idx)
    return kept


def curate(rec: Dict) -> bool:
    if not rec.get("name"):
        return False
    name_low = rec["name"].lower()
    if any(bad in name_low for bad in ("parking", "bus stop", "traffic signal")):
        return False
    if not rec.get("phone") and not rec.get("website"):
        if rec.get("category") != CATEGORIES["salvage"].label:
            return False
        if not SALVAGE_WORD.search((rec.get("name", "") + " " + " ".join(rec.get("tags", []))).lower()):
            return False
    return True


def state_jobs(states: List[str]) -> List[Tuple[str, str, Optional[Tuple[float, float, float, float]]]]:
    jobs: List[Tuple[str, str, Optional[Tuple[float, float, float, float]]]] = []
    for state in states:
        if state in LARGE_STATE_BBOXES:
            for bbox in LARGE_STATE_BBOXES[state]:
                jobs.append((state, "bbox", bbox))
        else:
            jobs.append((state, "area", None))
    return jobs


def extract_record(state: str, el: Dict) -> Optional[Dict]:
    tags = el.get("tags") or {}
    lat = el.get("lat")
    lon = el.get("lon")
    if lat is None or lon is None:
        c = el.get("center") or {}
        lat = c.get("lat")
        lon = c.get("lon")
    if lat is None or lon is None:
        return None

    name = best_tag(tags, "name")
    text_blob = " ".join(
        filter(
            None,
            [
                best_tag(tags, "name"),
                best_tag(tags, "description"),
                best_tag(tags, "operator"),
                best_tag(tags, "brand"),
                best_tag(tags, "website"),
                best_tag(tags, "contact:website"),
            ],
        )
    )

    category = choose_category(tags, text_blob)
    if not category:
        return None

    city = best_tag(tags, "addr:city", "addr:town", "addr:village")
    phone = best_tag(tags, "phone", "contact:phone")
    website = best_tag(tags, "website", "contact:website", "url")
    rec = {
        "business_id": "",
        "name": name,
        "category": category,
        "city": city,
        "state": state,
        "phone": phone,
        "website": website,
        "google_maps_link": f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}",
        "tags": tags_for(category, text_blob),
        "jeep_note": infer_jeep_note(text_blob),
        "source": "OSM",
        "osm_id": f"{el.get('type')}/{el.get('id')}",
        "lat": float(lat),
        "lon": float(lon),
    }
    return rec


def assign_business_ids(records: List[Dict]) -> None:
    used = set()
    for rec in sorted(records, key=lambda r: (r["state"], r["category"], r["name"].lower(), r["osm_id"])):
        base = f"{slugify(rec['name'])}-{rec['state'].lower()}"
        bid = base
        i = 2
        while bid in used:
            bid = f"{base}-{i}"
            i += 1
        rec["business_id"] = bid
        used.add(bid)


def write_json(path: Path, rows: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)


def write_csv(path: Path, rows: List[Dict]) -> None:
    cols = [
        "business_id",
        "name",
        "category",
        "city",
        "state",
        "phone",
        "website",
        "google_maps_link",
        "tags",
        "jeep_note",
        "source",
        "osm_id",
        "lat",
        "lon",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for row in rows:
            out = dict(row)
            out["tags"] = ", ".join(row.get("tags", []))
            w.writerow({k: out.get(k, "") for k in cols})


def run(args: argparse.Namespace) -> int:
    states = [s.strip().upper() for s in args.states.split(",") if s.strip()]
    states = [s for s in states if s not in EXCLUDED_STATES]
    if not states:
        raise SystemExit("No states to process after exclusions.")

    all_rows: List[Dict] = []
    jobs = state_jobs(states)
    for idx, (state, kind, bbox) in enumerate(jobs, start=1):
        if kind == "area":
            query = overpass_query_for_area(state)
            geo = "state-boundary"
        else:
            query = overpass_query_for_bbox(bbox)  # type: ignore[arg-type]
            geo = f"bbox={bbox}"
        print(f"[{idx}/{len(jobs)}] Fetch {state} via {geo}")
        payload = overpass_fetch(args.overpass_url, query)
        for el in payload.get("elements", []):
            rec = extract_record(state, el)
            if rec:
                all_rows.append(rec)
        time.sleep(args.sleep_seconds)

    raw_count = len(all_rows)
    deduped = dedupe(all_rows)
    curated = [r for r in deduped if curate(r)]
    assign_business_ids(curated)
    curated = sorted(curated, key=lambda r: (r["state"], r["category"], r["name"].lower()))

    out_dir = Path(args.out_dir)
    write_json(out_dir / "all" / "listings.json", curated)
    write_csv(out_dir / "all" / "listings.csv", curated)

    by_state: Dict[str, List[Dict]] = defaultdict(list)
    by_category: Dict[str, List[Dict]] = defaultdict(list)
    for row in curated:
        by_state[row["state"]].append(row)
        by_category[row["category"]].append(row)

    for state, rows in by_state.items():
        write_json(out_dir / "by_state" / f"{state.lower()}.json", rows)
        write_csv(out_dir / "by_state" / f"{state.lower()}.csv", rows)
    for category, rows in by_category.items():
        slug = slugify(category)
        write_json(out_dir / "by_category" / f"{slug}.json", rows)
        write_csv(out_dir / "by_category" / f"{slug}.csv", rows)

    manifest = {
        "states_requested": states,
        "states_excluded": sorted(EXCLUDED_STATES),
        "jobs": len(jobs),
        "records_raw": raw_count,
        "records_after_dedupe": len(deduped),
        "records_final": len(curated),
        "overpass_url": args.overpass_url,
        "generated_at_epoch": int(time.time()),
    }
    write_json(out_dir / "run_manifest.json", [manifest])
    print(json.dumps(manifest, indent=2))

    if args.min_total and len(curated) < args.min_total:
        print(f"WARNING: final listings {len(curated)} is below target {args.min_total}")
        return 2
    return 0


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Seed directory listings from OSM/Overpass")
    p.add_argument(
        "--states",
        default=",".join(DEFAULT_STATES),
        help="Comma-separated state codes to process (TX/TN are automatically excluded).",
    )
    p.add_argument("--overpass-url", default="https://overpass-api.de/api/interpreter")
    p.add_argument("--out-dir", default="data/import/osm_seed")
    p.add_argument("--sleep-seconds", type=float, default=1.2)
    p.add_argument("--min-total", type=int, default=500)
    return p.parse_args()


if __name__ == "__main__":
    raise SystemExit(run(parse_args()))
