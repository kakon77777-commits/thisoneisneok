"""What the real interpreter does, measured — not what its source code says it does.

Every row here is a subprocess that imports a module whose source changed after
its .pyc was written, and prints the value that actually ran. The re-cut in
cache.py is compared against these results cell by cell, so "the re-cut copies
upstream's rule" is a measurement that can come out false.
"""
import importlib.util
import os
import py_compile
import shutil
import struct
import subprocess
import sys
import tempfile

FIRST = "VALUE = 'AAA'\n"
SAME_SIZE = "VALUE = 'BBB'\n"       # same byte length as FIRST
LONGER = "VALUE = 'BBBB'\n"         # one byte longer

MODES = {
    "timestamp": py_compile.PycInvalidationMode.TIMESTAMP,
    "checked_hash": py_compile.PycInvalidationMode.CHECKED_HASH,
    "unchecked_hash": py_compile.PycInvalidationMode.UNCHECKED_HASH,
}

EDITS = [
    {"id": "natural", "label": "two writes, whatever the clock did", "to": SAME_SIZE, "mtime": "leave"},
    {"id": "restored", "label": "mtime put back, same size", "to": SAME_SIZE, "mtime": "restore"},
    {"id": "resized", "label": "mtime put back, size changed", "to": LONGER, "mtime": "restore"},
    {"id": "advanced", "label": "mtime forced +5s, same size", "to": SAME_SIZE, "mtime": "forward"},
]


def observe(path):
    stat = os.stat(path)
    fields = struct.unpack("<II", importlib.util.source_hash(open(path, "rb").read()))
    return {"mtime": int(stat.st_mtime), "size": stat.st_size, "hash": fields}


def probe(edit, mode_name):
    """Compile, edit the source, import in a fresh interpreter, report what ran."""
    tmp = tempfile.mkdtemp()
    try:
        source = os.path.join(tmp, "probe_mod.py")
        with open(source, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(FIRST)
        cached = importlib.util.cache_from_source(source)
        py_compile.compile(source, cfile=cached, invalidation_mode=MODES[mode_name], doraise=True)

        before = observe(source)
        header = open(cached, "rb").read(16)
        stat = os.stat(source)
        with open(source, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(edit["to"])
        if edit["mtime"] == "restore":
            os.utime(source, (stat.st_atime, stat.st_mtime))
        elif edit["mtime"] == "forward":
            os.utime(source, (stat.st_atime, stat.st_mtime + 5))
        after = observe(source)

        result = subprocess.run([sys.executable, "-c", "import probe_mod; print(probe_mod.VALUE)"],
                                cwd=tmp, capture_output=True, text=True)
        ran = result.stdout.strip()
        wanted = edit["to"].split("'")[1]
        return {
            "ran": ran,
            "ran_stale": ran != wanted,
            "before": before,
            "after": after,
            "header": header,
            "metadata_moved": before["mtime"] != after["mtime"] or before["size"] != after["size"],
            "bytes_moved": before["hash"] != after["hash"],
        }
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def measured_facts():
    """The numbers FMS declares, taken from the interpreter running right now."""
    import inspect

    import importlib._bootstrap_external as bootstrap

    return {
        "bootstrap_external_lines": sum(1 for _ in open(bootstrap.__file__, encoding="utf-8")),
        "validate_timestamp_pyc_lines": len(inspect.getsource(bootstrap._validate_timestamp_pyc).splitlines()),
        "validate_hash_pyc_lines": len(inspect.getsource(bootstrap._validate_hash_pyc).splitlines()),
        "header_bytes": 16,
        "evidence_bytes": 8,
        "default_invalidation_mode": py_compile._get_default_invalidation_mode().name,
    }


def unsupported_flags(flag_value):
    """What an unreadable flags field does to the cache.

    The first version of this probe left the source matching the cache, so
    "cache used" and "cache rejected" printed the same string and the
    measurement could not tell them apart. It reported exit 0 and I nearly
    filed that as confirmation of a claim in FMS. It is the same defect this
    whole entry is about, committed while writing about it.

    So: the source is edited to disagree with the cache first, and the mtime is
    put back. Reading AAA now means the cache was used; reading BBB means it was
    rejected and the source recompiled. Pass flag_value=0 for the control.
    """
    tmp = tempfile.mkdtemp()
    try:
        source = os.path.join(tmp, "probe_mod.py")
        with open(source, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(FIRST)
        cached = importlib.util.cache_from_source(source)
        py_compile.compile(source, cfile=cached, doraise=True)

        stat = os.stat(source)
        with open(source, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(SAME_SIZE)
        os.utime(source, (stat.st_atime, stat.st_mtime))

        blob = bytearray(open(cached, "rb").read())
        blob[4:8] = struct.pack("<I", flag_value)
        with open(cached, "wb") as handle:
            handle.write(blob)

        result = subprocess.run([sys.executable, "-c", "import probe_mod; print(probe_mod.VALUE)"],
                                cwd=tmp, capture_output=True, text=True)
        ran = result.stdout.strip()
        return {"flags": flag_value, "exit": result.returncode, "ran": ran,
                "cache_used": ran == "AAA", "recompiled": ran == "BBB",
                "stderr_tail": result.stderr.strip().splitlines()[-1] if result.stderr.strip() else ""}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
