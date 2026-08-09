"""What is falsifiable, what stopped being watched, and what nobody explained."""


def render(clause_reports, continuity_report, cases, version, previous_version, fatal):
    out = ["", f"== clauses, and whether anything can break them  ({previous_version} -> {version})"]
    for report in clause_reports:
        mark = "ok " if report["falsifiable"] else "!! "
        out.append(f"  {mark} {report['clause']}")
        for w in report["witnesses"]:
            state = "breaks it " if w["falsifies"] else "PROVES NOTHING"
            out.append(f"        {state}  {w['witness']:<22} {w['detail'][:52]}")
        if not report["falsifiable"]:
            out.append("        no listed witness can make this clause complain — it is green and could not be otherwise")

    out.append("")
    out.append("== witness continuity")
    unexplained = []
    for entry in continuity_report:
        if not entry["lost"] and not entry["added"]:
            out.append(f"  ok  {entry['clause']:<22} {len(entry['kept'])} kept")
            continue
        out.append(f"  !!  {entry['clause']:<22} {len(entry['kept'])} kept"
                   + (f", {len(entry['added'])} added" if entry["added"] else ""))
        for lost in entry["lost"]:
            if lost["reason"]:
                out.append(f"        removed  {lost['witness']:<22} reason: {lost['reason']}")
            else:
                out.append(f"        REMOVED  {lost['witness']:<22} with no reason recorded")
                unexplained.append(lost["witness"])

    out.append("")
    out.append("== distinct semantic cases, not input count")
    for clause, (count, names) in cases.items():
        out.append(f"  {clause:<24} {count}  {', '.join(names)}")
    out.append("")
    out.append("  Ten copies of one fixture are one case. A count of inputs can be inflated")
    out.append("  by duplication; a count of distinct cases needs someone to write a new")
    out.append("  sentence describing a new one.")

    out.append("")
    if unexplained:
        verdict = "FATAL" if fatal else "reported"
        out.append(f"  {len(unexplained)} witness(es) removed with no reason: {', '.join(unexplained)}  [{verdict}]")
    else:
        out.append("  every removal carries a reason")
    return "\n".join(out) + "\n"
