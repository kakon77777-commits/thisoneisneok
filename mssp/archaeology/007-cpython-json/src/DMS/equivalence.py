"""What the two implementations agreed and disagreed about, clause by clause.

The point is not "are they the same". It is "are they the same in the ways the
contract says they must be" — because 'the same' is not a property a machine can
check without being told which observations count.
"""


def compare(contract, corpus, a_name, a_result, b_name, b_result):
    a_values, a_errors = a_result
    b_values, b_errors = b_result
    findings = {"identical_values": 0, "differing_values": [], "same_error_class": 0,
                "differing_error_text": [], "differing_error_class": [], "acceptance_differs": []}

    for item, av, bv, ae, be in zip(corpus, a_values, b_values, a_errors, b_errors):
        label = repr(item)[:40]
        if (ae is None) != (be is None):
            findings["acceptance_differs"].append((label, a_name if ae is None else b_name))
            continue
        if ae is None:
            if av == bv:
                findings["identical_values"] += 1
            else:
                findings["differing_values"].append((label, av, bv))
            continue
        if ae[0] != be[0]:
            findings["differing_error_class"].append((label, ae[0], be[0]))
        else:
            findings["same_error_class"] += 1
            if ae[1] != be[1]:
                findings["differing_error_text"].append((label, ae[1], be[1]))
    return findings


def verdict(contract, findings, error_text_must_match):
    """Contract clauses, each answered by the run."""
    clauses = []
    clauses.append(("encoded output identical for every value",
                    not findings["differing_values"],
                    f"{findings['identical_values']} identical, {len(findings['differing_values'])} differing"))
    clauses.append(("the class of error is the same",
                    not findings["differing_error_class"],
                    f"{findings['same_error_class']} same class, {len(findings['differing_error_class'])} differing"))
    clauses.append(("acceptance is the same",
                    not findings["acceptance_differs"],
                    f"{len(findings['acceptance_differs'])} input(s) one accepted and the other did not"))
    # A waived pass must never render as a pass. The first version of this line
    # printed "ok" with "(contract says MAY differ)" appended, and a reader
    # skimming the column saw four greens over an observed difference. The
    # verdict WITHOUT the waiver is now shown beside the one with it, because
    # that is the only thing separating "a declared, temporary exception" from
    # "the system's identity was quietly rewritten".
    text_differs = bool(findings["differing_error_text"])
    unwaived = not text_differs
    waived = unwaived or not error_text_must_match
    label = "error text identical"
    if text_differs and waived:
        label += "  [WAIVED — would FAIL without the contract's may-differ]"
    elif not error_text_must_match:
        label += "  (contract says MAY differ; nothing used the waiver)"
    clauses.append((label, waived, f"{len(findings['differing_error_text'])} message(s) differ"))
    return clauses


def render(a_name, b_name, findings, clauses):
    lines = ["", f"== {a_name} vs {b_name}"]
    for label, ok, detail in clauses:
        lines.append(f"  {'ok ' if ok else '!! '} {label:<52} {detail}")
    if findings["differing_error_text"]:
        lines.append("")
        lines.append("  the observable difference, in full:")
        for label, a, b in findings["differing_error_text"]:
            lines.append(f"    input {label}")
            lines.append(f"      {a_name:<12} {a}")
            lines.append(f"      {b_name:<12} {b}")
    lines.append("")
    lines.append("  under 'same value' the accelerator is NOT structural.")
    lines.append("  under 'same message' it is observable. The contract is what decides.")
    return "\n".join(lines) + "\n"
