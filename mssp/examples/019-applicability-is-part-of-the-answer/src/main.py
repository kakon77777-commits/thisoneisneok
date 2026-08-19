"""Three sources, and a measurement that says when it does not apply.

    python src/main.py            the run under the policy SCL names
    python src/main.py --control  the same units under a policy that ignores declarations
    python src/main.py --total    ask for a total across all three
    python src/main.py --strict   exit 1 on an unmeasurable unit or a contradicted assumption
"""
import sys

from DMS import report
from SCL import policy
from SMS import measure


def main(argv):
    sources, policies, problems = measure.load()
    if problems:
        for problem in problems:
            print(f"  REFUSED: {problem}")
        return 1

    name = "ignore-declared" if "--control" in argv else policy.policy_name()
    in_force = policies[name]
    measured = measure.measure_all(in_force, sources)

    print(f"\n  {policy.describe()}")
    if name != policy.policy_name():
        print(f'  --control: running {name} instead - {in_force.WHAT_IT_DOES_WITH_A_DECLARATION}')
    print()
    print(report.measurements(measured))
    print()
    print(report.what_a_bare_number_would_have_said(measured))

    if "--total" in argv:
        print()
        try:
            print(f"  total incentive: {measure.total_incentive(measured)}")
        except ValueError as refused:
            print(report.refusal(refused))

    contradictions = [c for c in (policy.contradicts(m) for m in measured) if c]
    unmeasured = [m["source"] for m in measured if not m["applicable"]]
    if contradictions:
        print()
        for line in contradictions:
            print(f"  CONTRADICTS SCL: {line}")
    if unmeasured:
        print(f'  NOT MEASURED: {", ".join(unmeasured)} - the assumption is neither confirmed '
              f'nor contradicted there')

    if "--strict" in argv and (contradictions or (unmeasured and policy.unmeasurable_is_fatal())):
        print("\n  --strict: an unmeasurable unit or a contradicted assumption, both fatal here")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
