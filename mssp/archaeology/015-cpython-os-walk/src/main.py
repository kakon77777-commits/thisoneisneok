"""os.walk: what it does with an error it meets on the way.

    python src/main.py            the two causes, the two modes
    python src/main.py --strict   exit 1 if this deployment walks silently
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))

from DMS import report  # noqa: E402
from SCL import policy  # noqa: E402
from SMS import upstream, walks  # noqa: E402
from TMS.modes import reporting as reporting_mode  # noqa: E402

ARCH = json.loads((HERE / "FMS" / "architecture.json").read_text(encoding="utf-8"))


def main(argv):
    out = lambda line="": sys.stdout.write(line + "\n")  # noqa: E731
    loaded, problems = walks.load()
    if problems:
        for problem in problems:
            out(f"  !! {problem}")
        return 1

    out(f"\n== os.walk{upstream.signature()}  [python {sys.version.split()[0]}]")
    report.causes(upstream.empty_versus_missing(), out)
    report.modes(upstream.vanishing_subdirectory(),
                 upstream.vanishing_subdirectory(onerror=reporting_mode.make_collector), out)

    out("\n== what the source says about onerror")
    for line in upstream.onerror_lines():
        out(f"    {line}")
    out("    one branch. Absent it, the error is discarded and the walk continues.")

    module, problem = walks.resolve(policy.mode(), loaded)
    if problem:
        out(f"\n  !! {problem}")
        return 1
    out(f"\n== this deployment walks in `{module.NAME}` mode")
    out(f"    reports errors: {module.REPORTS_ERRORS}")
    out(f"    the caller sees: {module.WHAT_THE_CALLER_SEES}")

    report.gaps(out)

    if "--strict" in argv and not module.REPORTS_ERRORS and policy.silent_is_fatal():
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
