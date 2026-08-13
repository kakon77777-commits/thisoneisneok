# 013 — Approval is an act, not a property of content

> `candidate`. This is yesterday's defect, made into a measurement.

## What this program does

Four rules decide whether three parties approved a claim, run over **two worlds
whose every artifact is identical** and which differ only in who placed them.

```bash
python src/main.py            # every rule over both worlds
python src/main.py --strict   # exit 1 if the configured rule cannot separate them
python src/island_test.py     # 18 checks across 5 sections
```

```console
  rule                   reads  three parties    one author      separates?
  digest-bound-record    2      approved         approved        no
  distinct-provenance    3      approved         refused         YES
  explicit-record        1      approved         approved        no
  identical-content      1      approved         approved        no
```

## The structural decision

**Approval is not a property of content. It is an act, and an act must leave a
trace outside the artifact it is about — otherwise it is content wearing the
word "approved".**

Three of the four rules cannot tell the worlds apart, and they are exactly the
three that read only the artifacts. **Reading more of the artifacts does not
help**: `digest-bound-record` reads twice as much as `identical-content` and
fails the same way. Digest binding is a real property — it stops an approval
surviving an edit to the thing approved — and it is not this one.

## Where it came from

On 2026-08-12 I shipped a consensus mechanism that read three identical branch
files as three-way agreement. **I had written all three in one commit.** Metron
and Pragma found it within the hour, and their sentence is the title of this
example: 相同內容不等於 owner 批准.

`identical-content` is in `TMS/rules/` rather than deleted, because it is the
thing being measured.

## The island test

Each rule declares what it **cannot** distinguish, and section 2 checks that
declaration by running it over both worlds rather than reading it:

```text
  PASS  identical-content: declares blind to a single author = True, measured True
  PASS  distinct-provenance: declares blind to a single author = False, measured False
```

Section 2b is the drill: a rule that approves everything while claiming to
separate must be caught, or section 2 is two labels agreeing.

Section 1 carries the check that [example 011](/html/mssp/011-store-boundary.html)
needed the hard way — FMS's units map compared against the tree.

## The ceiling, measured next door

`distinct-provenance` moves the question from the artifacts to the provenance
store. It does not end it, and
[archaeology 013](/html/mssp/archaeology/013-git-authorship.html) measures
exactly where it stops: in git, a commit claiming to be anyone is the same kind
of object as an honest one, and the only field that records an act rather than a
claim reports the **same value** for both when nobody signs.

## What this example does not solve

**Measurable, not measured.** What requiring distinct provenance costs a party
legitimately acting on another's behalf.

**Not measurable here.** Whether the provenance store is honest — and whether
anyone who approved meant it. Nothing here, and nothing anywhere, reads intent.
