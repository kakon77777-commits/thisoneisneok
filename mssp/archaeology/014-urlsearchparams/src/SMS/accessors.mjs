// The re-cut: every accessor declares how many values survive it.
//
// URLSearchParams has no such declaration. `get` and `Object.fromEntries` are
// both one-value reads, they disagree about WHICH value, and the interface
// offers no way to ask either of them what it just discarded.
const NAMES = ["get", "get_all", "from_entries", "set", "append"];

export async function load() {
  const loaded = {};
  const problems = [];
  for (const name of NAMES) {
    const module = await import(`../TMS/accessors/${name}.mjs`);
    for (const attribute of ["ACCESSOR", "KEEPS", "HOW_MANY_SURVIVE"]) {
      if (!module[attribute]) problems.push(`${name} does not declare ${attribute}`);
    }
    if (!["one", "all"].includes(module.HOW_MANY_SURVIVE)) {
      problems.push(`${name}: HOW_MANY_SURVIVE must be one or all, not ${module.HOW_MANY_SURVIVE}`);
    }
    loaded[module.ACCESSOR] = module;
  }
  return { loaded, problems };
}

export function resolve(name, loaded) {
  const module = loaded[name];
  if (!module) {
    return { problem: `accessor "${name}" has no unit - fail closed (known: ${Object.keys(loaded).sort().join(", ")})` };
  }
  return { module };
}

// The declaration, checked by running it rather than by reading it.
export function survivorCount(name, query) {
  const params = new URLSearchParams(query);
  if (name === "get") return params.get("tag") === null ? 0 : 1;
  if (name === "get_all") return params.getAll("tag").length;
  if (name === "from_entries") return Object.fromEntries(params).tag === undefined ? 0 : 1;
  if (name === "set") { params.set("tag", "z"); return params.getAll("tag").length; }
  if (name === "append") { params.append("tag", "z"); return params.getAll("tag").length; }
  return null;
}
