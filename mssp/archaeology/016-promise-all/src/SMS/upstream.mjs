// Probes that run the real V8 built-ins. Nothing here is simulated.
//
// Every probe records which members actually executed, because the whole
// finding is that work runs and is then thrown away.

// A member that resolves or rejects after `ms`, appending its name to `ran`
// the moment it settles. `ran` is how we know the work happened.
export function member(ran, name, ms, { rejects = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      ran.push(name);
      if (rejects) reject(new Error(`${name} broke`));
      else resolve(`${name}:ok`);
    }, ms);
  });
}

export async function withAll(build) {
  const ran = [];
  try {
    const values = await Promise.all(build(ran));
    return { ran, settled: true, values, reason: null };
  } catch (raised) {
    return { ran, settled: false, values: null, reason: raised.message };
  }
}

export async function withAllSettled(build) {
  const ran = [];
  const results = await Promise.allSettled(build(ran));
  return { ran, results };
}

// One rejecting member among three that fulfil.
export const oneRejects = (ran) => [
  member(ran, "a", 10), member(ran, "b", 20, { rejects: true }),
  member(ran, "c", 30), member(ran, "d", 40),
];

// The same input with the rejecting member taken out — the island test.
export const rejectingMemberRemoved = (ran) => [
  member(ran, "a", 10), member(ran, "c", 30), member(ran, "d", 40),
];

// The control: the same shape and the same count, and nothing rejects. Without
// it, "all and allSettled differ" is not a statement about failure.
export const noneReject = (ran) => [
  member(ran, "a", 10), member(ran, "b", 20),
  member(ran, "c", 30), member(ran, "d", 40),
];

// Two rejecting members. How many reasons reach the caller?
export const twoReject = (ran) => [
  member(ran, "b", 10, { rejects: true }), member(ran, "e", 20, { rejects: true }),
];

// A fast rejection alongside a slow fulfilment: does the rejection stop it?
export const fastRejectSlowMember = (ran) => [
  member(ran, "b", 5, { rejects: true }), member(ran, "slow", 60),
];

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const runtime = () => `${process.release?.name ?? "node"} ${process.version} (V8 ${process.versions.v8})`;
