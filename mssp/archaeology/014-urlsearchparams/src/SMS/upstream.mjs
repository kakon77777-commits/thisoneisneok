// What URLSearchParams actually does, measured against the running Node.
//
// Nothing here is exotic: a repeated key is what a browser sends when two
// checkboxes share a name, and every one of these accessors appears in ordinary
// request-handling code.
export const SAMPLE = "tag=a&tag=b&tag=c&q=x";

export function readings(query = SAMPLE) {
  const params = new URLSearchParams(query);
  return {
    "get(\"tag\")": params.get("tag"),
    "getAll(\"tag\")": params.getAll("tag"),
    "Object.fromEntries": Object.fromEntries(params).tag,
    "has(\"tag\")": params.has("tag"),
    size: params.size,
    "spread length": [...params].length,
  };
}

export function mutations(query = "tag=a&tag=b") {
  const withSet = new URLSearchParams(query);
  withSet.set("tag", "z");
  const withAppend = new URLSearchParams(query);
  withAppend.append("tag", "z");
  return { before: query, afterSet: withSet.toString(), afterAppend: withAppend.toString() };
}

export function returnValues() {
  const params = new URLSearchParams("k=v");
  return {
    "set(k,v)": new URLSearchParams().set("k", "v"),
    "append(k,v)": new URLSearchParams().append("k", "v"),
    "delete(k)": params.delete("k"),
    "get(missing)": new URLSearchParams().get("nope"),
  };
}

export function version() {
  return process.version;
}
