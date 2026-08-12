// The interleaving is written down, not raced for.
//
// No threads and no timing. A schedule is a list of which writer moves next, so
// a lost update here is a fact about the code rather than about this machine on
// this morning. Archaeology 012 runs the same schedule against real CPython dbm
// backends, which is what stops this from being a model agreeing with itself.

export function run(writers, order) {
  const cursors = writers.map(() => 0);
  const trace = [];
  for (const who of order) {
    const step = writers[who]?.[cursors[who]];
    if (!step) continue;
    cursors[who] += 1;
    trace.push({ who, ...step() });
  }
  // Anything the schedule did not reach still has to finish, in writer order.
  for (const [who, steps] of writers.entries()) {
    while (cursors[who] < steps.length) {
      trace.push({ who, ...steps[cursors[who]++]() });
    }
  }
  return trace;
}

// Re-run whoever was refused, one at a time, until nobody is.
//
// The first version of this looped on the WHOLE accumulated trace, so the
// original refusals never stopped satisfying the condition and it retried until
// the budget ran out - two increments ended at five. Only the newest round can
// answer "is anyone still being refused".
export function runWithRetries(makeWriters, order, budget = 5) {
  let round = run(makeWriters(), order);
  const trace = [...round];
  let rounds = 1;
  while (round.some((step) => step.retry) && rounds < budget) {
    const refused = [...new Set(round.filter((step) => step.retry).map((step) => step.who))];
    const writers = makeWriters();
    // An empty order means the drain runs each of them to completion in turn,
    // which is what a retry after a conflict actually is.
    round = run(refused.map((who) => writers[who]), []);
    trace.push(...round);
    rounds += 1;
  }
  return { trace, rounds };
}

// Two named schedules. The second is the control: it is what a test with a
// single writer produces, and it is why such a test cannot see any of this.
export const INTERLEAVED = [0, 1, 0, 1, 0, 1];
export const ONE_AT_A_TIME = [0, 0, 0, 1, 1, 1];
