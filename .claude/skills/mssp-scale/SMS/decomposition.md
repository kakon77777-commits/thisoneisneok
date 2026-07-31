# Deciding what goes where

## The identity test (SMS vs TMS)

> If this capability is removed, is the system still the system it was?

Not "is it used often". Frequently-used is not the same as constitutive. A task
runner that logs to five places uses the logger constantly, but delete the
logger and it is still a task runner. Delete the scheduler and it is not.

| Signal | Set |
|---|---|
| Every main task needs it | SMS |
| The task loop cannot close without it | SMS |
| Other modules depend on the interface it publishes | SMS |
| It carries validation, versioning, or a core data contract | SMS |
| It serves one platform, one format, one role, one domain | TMS |
| It can be swapped for a different implementation | TMS |
| It was added for one use case and no other module reads it | TMS |

When unsure, put it in TMS. Promoting a TMS to SMS later is a contained change;
demoting an SMS means every dependant has to be revisited.

## The trap: everything becomes SMS

If each capability looks essential, nothing can be loaded on demand and nothing
can be replaced safely. SMS has quietly become the monolith again (§15.3). Ask
the identity question about each SMS entry periodically and expect some to fail.

## Dependency rule

Allowed:

```
TMS-A  ->  SMS-shared-contract  <-  TMS-B
```

Forbidden:

```
TMS-A  ->  TMS-B  ->  TMS-C  ->  TMS-A
```

Two TMS that must cooperate do so through an interface or event contract that
SMS owns. A direct TMS-to-TMS import means one of them is not independently
loadable, so neither is really a subset.

The check is mechanical: grep a TMS module for imports of any sibling TMS path.
One hit is a failure, regardless of how reasonable it looks.

## Knowledge and permission are different axes

`Know(agent, capability) = 1` does not imply `Permit(agent, operation) = 1`.

A module may fully describe how to delete a production record and still hold no
permission to do so. Where the two are mixed, the boundary is enforced only by
the model's willingness to obey prose — which is an expectation, not a contract
(§15.5). Permission belongs in SCL, expressed so a runtime can check it.

## FMS stays non-executable

The moment FMS carries concrete procedure, tool parameters, or long domain
content, it stops being a navigation layer and becomes another monolith with a
different filename (§15.4). FMS holds: narrative, scope, non-goals, capability
index, terminology, decisions, version policy, risk classes. Nothing else.

## Applying this to a programming-language example

The sets are roles, not directories that must exist. A 200-line example with an
empty `TMS/` folder demonstrates nothing. Create a set only when it has real
content; say in the README which sets the example deliberately omits and why.

For code specifically:

- **FMS** — the README and the module manifest. What this program is.
- **SCL** — configuration schema, the capability/permission table, limits.
- **SMS** — the domain model, the loop, validation, the interfaces TMS bind to.
- **TMS** — adapters, formats, one-domain rules, per-platform behaviour.
- **DMS** — the run log and whatever renders it into something a human reads.
