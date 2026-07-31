// SCL — what a task is allowed to do, checkable by the runtime.
//
// The point of putting this in its own set is that it is a check, not a
// sentence. "Please do not write outside the output directory" in a handler's
// comment is an expectation; this function is a contract, and the runner
// consults it before any handler runs.

import policy from "./permissions.json" with { type: "json" };

/** @returns {{allowed: boolean, reason?: string}} */
export function permits(task) {
  const rule = policy.types[task.type];
  if (!rule) return { allowed: false, reason: `type not in policy: ${task.type}` };

  if (rule.deny_all) return { allowed: false, reason: rule.note ?? "denied by policy" };

  if (rule.path_prefix && task.path) {
    // Compared after normalising separators so a Windows-style path in a task
    // definition is not silently treated as escaping the allowed prefix.
    const path = task.path.replaceAll("\\", "/");
    if (!path.startsWith(rule.path_prefix)) {
      return { allowed: false, reason: `path outside ${rule.path_prefix}` };
    }
    if (path.includes("..")) return { allowed: false, reason: "path traversal" };
  }

  if (rule.hosts && task.url) {
    const host = new URL(task.url).host;
    if (!rule.hosts.includes(host)) return { allowed: false, reason: `host not allowed: ${host}` };
  }

  return { allowed: true };
}

export const riskLevel = (task) => policy.types[task.type]?.risk ?? "unknown";
