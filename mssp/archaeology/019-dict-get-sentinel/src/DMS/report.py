"""What a person is shown.

`value` is never printed without `present`, because that pairing is the entire
subject of the entry.
"""


def reads(rows):
    lines = ["    mapping         reader                  value    present   raised"]
    for row in rows:
        present = "-" if row.get("present") is None else str(row["present"])
        lines.append(f'    {row["mapping"]:<15} {row["reader"]:<23} {repr(row["value"]):<8} '
                     f'{present:<9} {row["raised"] or "-"}')
    return "\n".join(lines)


def falsy(rows, collapsed, present):
    lines = ["    case                        not d.get('a')   'a' in d"]
    for row in rows:
        lines.append(f'    {row["case"]:<27} {str(row["falsy"]):<16} {row["has_key"]}')
    lines.append(f"    {collapsed} of {len(rows)} take the same branch, and {present} of those "
                 f"{collapsed} have the key")
    return "\n".join(lines)
