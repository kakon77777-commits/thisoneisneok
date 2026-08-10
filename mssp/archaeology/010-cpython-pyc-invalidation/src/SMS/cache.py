"""The re-cut: a header, a flags-to-validator resolution, and the validation.

Upstream all three live inside `_bootstrap_external.py` alongside path finders,
loaders, and the zip importer. Lifting the validator out is the only structural
change; the rule itself is copied, and DMS compares the result against the real
interpreter on every run so that "copied" is a measurement rather than a claim.
"""
import importlib
import struct

MAGIC = b"\x00\x00\x0d\x0a"
HEADER = "<4sIII"
HEADER_BYTES = struct.calcsize(HEADER)

VALIDATORS = ["timestamp", "checked_hash", "unchecked_hash"]


def load_validators():
    """Resolve each validator module and check it agrees about its own flags."""
    loaded, problems = {}, []
    for name in VALIDATORS:
        try:
            module = importlib.import_module(f"TMS.validators.{name}")
        except ModuleNotFoundError:
            problems.append(f'validator "{name}" has no module - fail closed')
            continue
        for attribute in ("MODE", "FLAGS", "READS", "ABOUT", "UNCONDITIONAL"):
            if not hasattr(module, attribute):
                problems.append(f"{name} does not declare {attribute}")
        loaded[module.FLAGS] = module
    return loaded, problems


def resolve(flags, loaded):
    """Upstream's rule: bit 0 says hash-based, bit 1 says check it.

    Anything above those two bits stops the import - which main.py checks by
    writing such a header rather than by reading the source and believing it.
    """
    if flags & ~0b11:
        return None, f"flags {flags} set bits outside 0b11 - fail closed"
    module = loaded.get(flags)
    if module is None:
        return None, f"no validator for flags {flags} - fail closed"
    return module, None


def write_header(flags, field2, field3):
    return struct.pack(HEADER, MAGIC, flags, field2, field3)


def read_header(blob):
    magic, flags, field2, field3 = struct.unpack(HEADER, blob[:HEADER_BYTES])
    return {"magic": magic, "flags": flags, "field2": field2, "field3": field3}


def header_for(module, observed):
    """What each mode would store about a source in this state."""
    if module.MODE == "TIMESTAMP":
        return write_header(module.FLAGS, observed["mtime"] & 0xFFFFFFFF, observed["size"])
    return write_header(module.FLAGS, *observed["hash"])


def validate(blob, observed, loaded):
    header = read_header(blob)
    module, problem = resolve(header["flags"], loaded)
    if problem:
        return None, problem
    return module.is_fresh(header, observed), None
