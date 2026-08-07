"""Counts and net difference. Remove it and there is nothing to report."""


def summarise(result):
    net = sum(a["cents"] - b["cents"] for a, b in result["differing"])
    return {
        "matched": len(result["matched"]),
        "differing": len(result["differing"]),
        "only_left": len(result["only_left"]),
        "only_right": len(result["only_right"]),
        "net_difference_cents": net,
    }
