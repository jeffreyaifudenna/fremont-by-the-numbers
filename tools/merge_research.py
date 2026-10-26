#!/usr/bin/env python3
"""Copy a researcher's JSON output into data/ and register it in data/_catalog.json.

Usage: python3 tools/merge_research.py <source.json> <dataset_id> "<Title>" "<Description>"
Every row keeps its source, source_url, period, kind and geo so the site can show them.
"""
import json, sys, os, datetime

src, ds, title, desc = sys.argv[1:5]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rows = json.load(open(src))
assert isinstance(rows, list), 'expected a JSON array'
for r in rows:
    for k in ('id', 'label', 'value', 'source', 'source_url'):
        assert k in r, f'row missing {k}: {r}'
out = os.path.join(root, 'data', ds + '.json')
json.dump(rows, open(out, 'w'), indent=1, ensure_ascii=False)
cat_path = os.path.join(root, 'data', '_catalog.json')
cat = json.load(open(cat_path))
cat[ds] = {'title': title, 'description': desc, 'updated': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}
json.dump(cat, open(cat_path, 'w'), indent=1, ensure_ascii=False)
print(f'{ds}: {len(rows)} rows -> data/{ds}.json')
