"""Route some requests, then load only what was selected.

    python src/main.py

The load step is four lines at the bottom and it is not part of the router. That
separation is the example.
"""
from __future__ import annotations

import importlib
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.ledger import render                    # noqa: E402
from SMS.model import Request                    # noqa: E402
from SMS.router import Router, Rule              # noqa: E402

RULES = [
    Rule("markdown-summary", "handlers/markdown",
         when=lambda r: r.kind == "markdown" and r.intent == "summarise"),
    Rule("csv-validate", "handlers/csv",
         when=lambda r: r.kind == "csv" and r.intent == "validate"),
    # Deliberately present and unreachable by the requests below: an ageing rule
    # set accumulates these, and the ledger is what makes that visible.
    Rule("image-thumbnail", "handlers/image",
         when=lambda r: r.kind == "image"),
]

REQUESTS = [
    Request(kind="markdown", intent="summarise", actor="app/editor"),
    Request(kind="csv", intent="validate", actor="app/importer"),
    Request(kind="csv", intent="validate", actor="anonymous"),      # refused
    Request(kind="pdf", intent="extract", actor="app/editor"),      # nothing matches
]

DOCUMENTS = {
    "markdown": "# Title\n\ntext\n\n## Section\n\nmore\n",
    "csv": "a,b,c\n1,2,3\n4,5\n",
}


def main() -> int:
    router = Router(RULES)
    decisions = [(request, router.route(request)) for request in REQUESTS]

    print("\n== router")
    print(render(router.coverage(), decisions))

    print("\n  loading only what was selected")
    for request, route in decisions:
        if not route.matched:
            continue
        # The whole resolution step. It lives here rather than in the router so
        # that the router never holds a reference to a capability.
        module = importlib.import_module("TMS." + route.capability.replace("/", ".").replace("handlers.", "handlers."))
        print(f"    {route.capability:<20} {module.handle(DOCUMENTS[request.kind])}")

    loaded = [m for m in sys.modules if m.startswith("TMS.")]
    print(f"\n  TMS modules in sys.modules: {len(loaded)}")
    print(f"    {', '.join(sorted(loaded))}")

    # The assertion worth making: the router named a capability that was never
    # loaded, which is only possible because a Route is a name.
    named = {r.capability for _, r in decisions if r.matched} | {"handlers/image"}
    unloaded = [c for c in named if "TMS." + c.replace("/", ".") not in sys.modules]
    if "handlers/image" not in unloaded:
        print("\n  EXAMPLE FAILED: handlers/image was loaded, and it does not exist")
        return 1
    print(f"    named but never loaded: {', '.join(sorted(unloaded))}")
    print("\n  the router decided about a capability that has no file at all.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
