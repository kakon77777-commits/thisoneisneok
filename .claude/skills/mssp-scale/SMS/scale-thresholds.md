# When MSSP is warranted, and when it is not

The method's own position (§12.4): applying it too early produces empty modules,
false abstractions, navigation cost, and boundaries frozen before anyone knows
where they belong. "Stay simple until the boundary appears" is part of the
method, not an exception to it.

## Small — do not structure

- one task
- one tool or none
- no high-risk operation
- no multiple roles

A single file plus tests. Adding FMS/SCL/SMS/TMS/DMS here makes the program
harder to read for zero benefit.

## Medium — structure partially

- several related tasks
- two to five tools
- some platform variation
- configuration worth validating

FMS, SMS, TMS. Add SCL when a permission actually needs enforcing, DMS when a
run's outcome stops being obvious.

## Large — full MSSP

Several of these together, not just one:

- more than three roles
- more than five external tools
- more than ten sub-capabilities
- read-only and writing operations in the same system
- any irreversible action
- different tasks needing genuinely different context
- multi-platform adaptation
- long-lived versioning
- several people or agents working on it
- sub-capabilities that need independent tests
- one document can no longer explain the system in a few minutes

## Using this when writing examples

An example demonstrating full MSSP on a small program is dishonest unless it
says so. Two legitimate ways to handle it:

1. Pick a problem genuinely at the threshold, so the structure earns itself.
2. Use a small problem and state plainly in the README that the structure is
   heavier than this size warrants, shown that way to make the parts visible.

The second is fine and often clearer for teaching. What is not fine is
presenting an over-structured toy as evidence that the method pays off.
