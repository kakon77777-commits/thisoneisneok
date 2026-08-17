"""What a person is shown.

The byte counts are never printed without the `eof` column beside them, because
the byte count is the number the two situations share.
"""


def reads(rows):
    lines = ["    stream        reader           bytes   eof     raised"]
    for row in rows:
        lines.append(
            f'    {row["stream"]:<13} {row["reader"]:<16} '
            f'{("-" if row["bytes"] is None else len(row["bytes"])):<7} '
            f'{str(row["eof"]) if row["eof"] is not None else "-":<7} {row["raised"] or ""}'.rstrip())
    return "\n".join(lines)


def identity(truncated, control):
    return "\n".join([
        f'    truncated stream -> {len(truncated["bytes"])} bytes  eof = {truncated["eof"]}',
        f'    complete  stream -> {len(control["bytes"])} bytes  eof = {control["eof"]}',
        f'    byte-identical   : {truncated["bytes"] == control["bytes"]}',
        f'    told apart by any returned value: {truncated["bytes"] != control["bytes"]}',
        f'    told apart by .eof              : {truncated["eof"] != control["eof"]}',
    ])


def after_the_split(complete, trailing):
    return "\n".join([
        f"    whole records the caller collects: {len(complete)}",
        f"    and one trailing fragment:         {trailing!r}",
        "    the fragment is well formed enough to be mistaken for a record",
    ])
