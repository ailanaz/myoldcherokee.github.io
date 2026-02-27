#!/usr/bin/env python3
"""Add a secondary 'tag' field to every guide entry in guides.json."""

import json, os

BASE  = os.path.dirname(os.path.abspath(__file__))
PATH  = os.path.join(BASE, 'assets', 'data', 'guides.json')

TAGS = {
    # ── No Start ────────────────────────────────────────────────────────────
    'cranks-but-will-not-start-fast-triage':                   'Spark / Fuel',
    'no-crank-battery-cables-grounds-starter-basics':          'No Crank',
    'starts-then-dies-idle-air-vacuum-basics':                 'Idle / Vacuum',
    'hot-restart-failure-heat-soak-checklist':                 'Heat Soak',
    'crank-position-sensor-cps-symptoms-and-tests':            'CPS',
    'renix-ground-refreshing-better-starts':                   'Grounds',
    'long-crank-time-normal-vs-problem':                       'Long Crank',
    'fuel-pump-runs-but-will-not-start-what-it-means':         'Fuel Pump',

    # ── Overheating ─────────────────────────────────────────────────────────
    'overheating-checklist-idle-vs-highway':                   'Checklist',
    'runs-hot-at-idle-fan-airflow-checks':                     'Fan / Airflow',
    'runs-hot-on-highway-radiator-flow-restriction-hose-checks': 'Radiator',
    'weak-heater-temp-swings-burping-air':                     'Air in System',
    'ac-makes-temps-climb-normal-vs-not':                      'A/C Load',
    'cooling-baseline-new-to-you-xj-what-to-inspect':         'Baseline',
    'coolant-filter-when-it-helps':                            'Coolant Filter',
    'renix-open-cooling-system-conversion-basics':             'Renix / Cooling',

    # ── Electrical ──────────────────────────────────────────────────────────
    'parasitic-battery-drain-test-safe-multimeter-steps':      'Battery Drain',
    'battery-keeps-dying-common-draw-sources':                 'Battery Drain',
    'renix-sensor-ground-upgrade-what-it-fixes':               'Grounds',
    'headlight-harness-upgrade-brighter-lights-with-relays':   'Headlights',
    'blower-only-works-on-high-melted-resistor-plug':          'Blower / HVAC',
    'renix-map-vacuum-line-upgrade-brittle-elbow-fix':         'MAP / Vacuum',
    'random-weird-electrical-behavior-start-with-grounds':     'Grounds',
    'common-problems-index-start-here-xj-owners':              'Index',
    'fuse-box-basics-xj-1984-2001':                            'Fuses',
    'xj-1997-2001-under-hood-fuse-box-pdc-basics':             'Fuses / PDC',
    'how-to-test-a-fuse-correctly':                            'Fuses',
    'fuse-keeps-blowing-find-the-short-safely':                'Fuses',
    'renix-fuse-panel-loose-terminals-repair-options':         'Fuses / Renix',
    'xj-fuse-diagrams-by-year-quick-links':                    'Fuses',

    # ── Suspension and Steering ─────────────────────────────────────────────
    'death-wobble-basics-what-it-is-and-what-it-is-not':       'Death Wobble',
    'death-wobble-inspection-order-track-bar-first':            'Death Wobble',
    'alignment-basics-toe-and-caster-plain-english':            'Alignment',
    'steering-stabilizer-myths-what-it-can-and-cannot-fix':    'Steering Stabilizer',
    'post-lift-checklist-what-to-recheck-after-lift':          'Post-Lift',
    'new-vibration-after-lift-simple-inspection-checklist':    'Post-Lift',

    # ── Engine and Idle ─────────────────────────────────────────────────────
    'clean-throttle-body-and-iac-smoother-idle':               'TB / IAC',
    'renix-tps-adjustment-what-it-helps-and-how-to-set':       'TPS / Renix',
    'renix-throttle-butterfly-stop-screw-why-it-causes-problems': 'Throttle / Renix',
    'running-lean-or-rough-idle-simple-checks':                'Lean / Idle',
    'vacuum-gauge-test-for-exhaust-restriction':               'Vacuum / Exhaust',
    'renix-map-vacuum-line-problems-symptoms-and-confirmation':'MAP / Vacuum',
    'common-xj-weak-links-what-fails-often':                   'Common Issues',
    'start-here-maintenance-baseline-after-buying-xj':         'Baseline',

    # ── 4WD and Transfer Case ───────────────────────────────────────────────
    '4wd-not-engaging-linkage-check-and-adjustment':           'Linkage',
    '4h-not-engaging-but-4l-works-what-to-check':              '4H / 4L',
    '4wd-lever-will-not-stay-put-quick-checks':                'Shift Lever',
    'loose-shifter-no-4wd-indicator-linkage-disconnected-check':'Linkage',
    'chain-stretch-vs-linkage-simple-symptoms':                'Chain / Linkage',
    'early-model-vacuum-disconnect-front-axle-why-4wd-fails':  'Vacuum Disconnect',
    'np231-vs-np242-how-to-identify-and-what-modes-mean':      'Transfer Case ID',
}

def main():
    with open(PATH, 'r', encoding='utf-8') as f:
        guides = json.load(f)

    updated = 0
    missing = []
    for g in guides:
        slug = g['slug']
        if slug in TAGS:
            g['tag'] = TAGS[slug]
            updated += 1
        else:
            missing.append(slug)

    if missing:
        print('WARNING — no tag defined for:', missing)

    with open(PATH, 'w', encoding='utf-8') as f:
        json.dump(guides, f, indent=2, ensure_ascii=False)

    print('Done. {} entries updated.'.format(updated))

if __name__ == '__main__':
    main()
