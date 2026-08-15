"""The two causes, the two modes, and what none of it can see."""


def causes(measured, out):
    out("\n  'the walk found nothing' — two causes:")
    out(f"    {'':<22} {'rows yielded':<14} files collected")
    for label in ("empty", "missing"):
        row = measured[label]
        out(f"    {label:<22} {row['rows']:<14} {row['files']}")
    out("\n    The rows differ. The files do not — and files is what the idiomatic")
    out("    `for _, _, files in os.walk(top)` collects. The discriminator exists")
    out("    and the ordinary way of using it destroys it.")


def modes(silent, reporting, out):
    out("\n  a subdirectory that disappears mid-walk:")
    out(f"    {'mode':<12} {'files':<26} errors")
    out(f"    {'silent':<12} {str(silent['files']):<26} {silent['errors'] or 'none reported'}")
    out(f"    {'reporting':<12} {str(reporting['files']):<26} {reporting['errors']}")
    out("\n    Same files. The only difference is whether anybody was told.")


def gaps(out):
    out("\n  measurable, not measured here:")
    out("    - how often a real traversal loses a directory to a permission error")
    out("    - how many callers pass onerror at all")
    out("\n  not measurable by this entry at all:")
    out("    - whether the default is wrong. A traversal that raised on every")
    out("      unreadable directory would be unusable on a real filesystem, and")
    out("      onerror exists precisely because the default cannot suit everyone.")
    out("    - what any caller believed an empty result meant.")
