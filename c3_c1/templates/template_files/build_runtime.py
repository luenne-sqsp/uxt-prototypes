"""
build_runtime.py
Stitches the four normalized files into a single runtime JSON that resolves
every industry ID to its fully-expanded template (placeholder + chips + appointments).

Usage:  python3 build_runtime.py
Output: runtime_industry_templates.json
"""
import json
from collections import OrderedDict

service_types  = json.load(open('service_types.json'))
template_sets  = json.load(open('template_sets.json'))
mapping        = json.load(open('industry_mapping.json'), object_pairs_hook=OrderedDict)
industry_ids   = json.load(open('industry_ids.json'), object_pairs_hook=OrderedDict)

def expand(slug):
    ts = template_sets[slug]
    return OrderedDict([
        ("template_set", slug),
        ("create_name_placeholder", ts["create_name_placeholder"]),
        ("create_name_chips", ts["create_name_chips"]),
        ("appointments", [service_types[a] for a in ts["appointments"]]),
    ])

runtime = OrderedDict()
for cid, slug in mapping.items():
    entry = OrderedDict()
    entry["labels"] = industry_ids[cid]["labels"]
    entry.update(expand(slug))
    runtime[cid] = entry

json.dump(runtime, open('runtime_industry_templates.json','w'), indent=2, ensure_ascii=False)
print(f"Wrote runtime_industry_templates.json with {len(runtime)} industries")
