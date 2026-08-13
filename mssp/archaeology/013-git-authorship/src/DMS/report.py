"""The log as git prints it, and which field could have told the difference."""


def log(rows, out):
    out(f"\n  {'commit':<9} {'author':<16} {'committer':<16} {'%G?':<5} subject")
    for row in rows:
        out(f"  {row['commit']:<9} {row['author']:<16} {row['committer']:<16} "
            f"{row['signature_status']:<5} {row['subject']}")


def fields(loaded, rows, separates, out):
    out(f"\n  {'field':<11} {'records':<7} {'separates honest from impersonating?':<38} value on both")
    for name, module in sorted(loaded.items()):
        if name in ("author", "committer"):
            # It differs, of course - but the difference is whatever the
            # impersonator typed. A field that varies is not a field that tells.
            answer = "it differs, and the difference is what was typed" if separates(rows, name) else "no"
            value = f"{rows[0][name]} vs {rows[1][name]}"
        elif name == "signature":
            answer = "no - both report N" if not separates(rows, "signature_status") else "yes"
            value = rows[0]["signature_status"]
        else:
            answer = "nothing in git reads it back"
            value = "-"
        out(f"  {module.NAME:<11} {module.KIND:<7} {answer:<38} {value}")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how many commits in a real repository carry a good signature")
    out("    - what fraction of Co-Authored-By trailers name someone who touched the branch")
    out("\n  not measurable by this entry at all:")
    out("    - whether git is wrong to work this way. A distributed VCS cannot")
    out("      have an authority that issues identities, and signing is offered")
    out("      precisely because the author field cannot be one.")
    out("    - whether any particular commit anywhere is honest. This measures")
    out("      what the fields CAN carry, not what they do carry.")
