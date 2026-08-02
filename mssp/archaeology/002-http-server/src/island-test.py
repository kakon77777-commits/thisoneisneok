"""The island test, and the measurement that motivated the re-cut.

    python src/island-test.py

Section 1 runs one handler with nothing else loaded and no connection.
Section 2 measures what the same thing costs upstream, by importing the real
module and asking what it takes to obtain one verb.
"""
from __future__ import annotations

import inspect
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from DMS.access_log import AccessLog                     # noqa: E402
from SCL import policy                                   # noqa: E402
from SMS.dispatch import dispatch                        # noqa: E402
from SMS.message import Request, Response, parse         # noqa: E402

failures: list[str] = []


def report(label: str, ok: bool, detail: str = "") -> None:
    print(f"  {'PASS' if ok else 'FAIL'}  {label}" + (f" - {detail}" if detail else ""))
    if not ok:
        failures.append(label)


print("\n== 1. one handler, alone, with no connection")

from TMS.handlers.health import HealthHandler            # noqa: E402

lines: list[str] = []
log = AccessLog(sink=lines.append)
parsed = parse(b"GET /health HTTP/1.1\r\n\r\n")
response = dispatch(parsed, [HealthHandler()], on_event=log.record)

report("handlers/health answered with only itself loaded", response.status == 200,
       f"HTTP {response.status} {response.reason}")
report("no socket, no server, no client address were needed",
       isinstance(parsed, Request) and response.body == b"ok")
report("the log went to the caller's sink", len(lines) == 1, f"{len(lines)} line(s)")

# the static handler is absent, so its method must not be answerable
absent = dispatch(parse(b"GET /index.html HTTP/1.1\r\n\r\n"), [HealthHandler()], on_event=log.record)
report("an absent handler is absent", absent.status == 405,
       f"HTTP {absent.status} - nothing loaded claims /index.html, and that is reported rather than guessed")

print("\n== 2. a rejection is a value, not a transmission")
bad = parse(b"nonsense\r\n\r\n")
report("the parser returns the rejection", isinstance(bad, Response) and bad.status == 400,
       "upstream parse_request calls send_error, so parsing needs a connection")

print("\n== 3. SCL refuses before the handler runs")
denied = dispatch(Request("DELETE", "/health", "HTTP/1.1"), [HealthHandler()], on_event=log.record)
report("a method no handler declares is refused", denied.status == 405,
       f"HTTP {denied.status}, Allow: {denied.headers.get('Allow')}")
report("policy is data, not prose", policy.may_handle("handlers/health", "GET")
       and not policy.may_handle("handlers/health", "DELETE"))

print("\n== 4. what one verb costs upstream")
import http.server as upstream                            # noqa: E402

module_lines = len(inspect.getsource(upstream).splitlines())
base_methods = [m for m in upstream.BaseHTTPRequestHandler.__dict__ if not m.startswith("__")]
mro = [c.__name__ for c in upstream.SimpleHTTPRequestHandler.__mro__]
dispatch_src = inspect.getsource(upstream.BaseHTTPRequestHandler.handle_one_request)
uses_getattr = bool(re.search(r"getattr\(self,\s*mname\)", dispatch_src))
log_src = inspect.getsource(upstream.BaseHTTPRequestHandler.log_message)

print(f"    module                       {module_lines} lines")
print(f"    BaseHTTPRequestHandler       {len(base_methods)} methods")
print(f"    SimpleHTTPRequestHandler MRO {' -> '.join(mro)}")
print(f"    dispatch by getattr          {uses_getattr}")
print(f"    log_message names sys.stderr {'sys.stderr' in log_src}")

report("upstream dispatches by attribute lookup, so handlers cannot be passed in", uses_getattr,
       "if this stops being true the re-cut's premise needs revisiting")
report("upstream's log destination is named in the function", "sys.stderr" in log_src)
report("a verb handler is reached only through the whole handler",
       "BaseHTTPRequestHandler" in mro and len(mro) >= 4,
       f"{len(mro)}-deep MRO, {len(base_methods)} inherited methods before the verb")

print()
if failures:
    print(f"  {len(failures)} check(s) failed: {', '.join(failures)}")
    raise SystemExit(1)
print("  island test passed")
