"""Rule resolution by id, and the two worlds the rules are run over."""
import hashlib
import importlib
import json

RULES = ["identical_content", "explicit_record", "digest_bound_record", "distinct_provenance"]

CLAIM = {"id": "fms-units-map", "body": {"title": "FMS declares its units and the tree is compared to it"}}
DIGEST = hashlib.sha256(json.dumps(CLAIM["body"], sort_keys=True).encode()).hexdigest()[:16]


def load_rules():
    loaded, problems = {}, []
    for module_name in RULES:
        try:
            module = importlib.import_module(f"TMS.rules.{module_name}")
        except ModuleNotFoundError:
            problems.append(f'rule "{module_name}" has no module - fail closed')
            continue
        for attribute in ("NAME", "READS", "CANNOT_DISTINGUISH", "approved"):
            if not hasattr(module, attribute):
                problems.append(f"{module_name} does not declare {attribute}")
        loaded[module.NAME] = module
    return loaded, problems


def resolve(name, loaded):
    module = loaded.get(name)
    if module is None:
        return None, f'rule "{name}" has no implementation - fail closed (known: {", ".join(sorted(loaded))})'
    return module, None


def _party(name):
    return {"name": name,
            "holds": {CLAIM["id"]: {"body": CLAIM["body"], "digest": DIGEST}},
            "approvals": [{"claim": CLAIM["id"], "digest": DIGEST}]}


PARTIES = [_party("elenchos"), _party("metron"), _party("pragma")]

# The two worlds. Every artifact is identical; only who placed them differs.
WORLDS = {
    "three parties": {"parties": PARTIES,
                      "provenance": {"elenchos": "elenchos", "metron": "metron", "pragma": "pragma"}},
    "one author":    {"parties": PARTIES,
                      "provenance": {"elenchos": "elenchos", "metron": "elenchos", "pragma": "elenchos"}},
}


def run(loaded):
    """Every rule over every world."""
    return [{"rule": name,
             "verdicts": {world: module.approved(CLAIM["id"], data["parties"], data["provenance"])
                          for world, data in WORLDS.items()},
             "reads": len(module.READS),
             "declared_blind_to": module.CANNOT_DISTINGUISH}
            for name, module in sorted(loaded.items())]
