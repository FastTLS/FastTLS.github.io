# HTTP, HTTPS, and SOCKS proxies

The SDKs explicitly support http, https, socks5, and socks5h proxy URLs for H1/H2 requests, streaming transfers, SSE, duplex, and WebSocket. Target TLS verification remains enabled.

```python
from fastls import Session, AsyncSession, Timeout

with Session(profile="chrome/156/windows",
             proxy="https://user:password@proxy.example:8443",
             proxy_ca_file="/path/to/private-proxy-ca.pem") as session:
    response = session.get("https://example.com/")
    direct = session.get("https://example.com/", proxy=None)
    other = session.get("https://example.com/",
                        proxy="socks5h://127.0.0.1:1080",
                        timeout=Timeout(total=30, connect=5))

# AsyncSession, stream, SSE, and duplex also accept proxy.
```

## Behavior

- http uses HTTP/1.1 CONNECT, default port 80, for both HTTP and HTTPS targets. The proxy must allow the target port. There is no absolute-form forwarding or downgrade/retry after rejection.
- https verifies the proxy certificate/hostname before HTTP/1.1 CONNECT, default port 443, TLS 1.2 minimum. Verification cannot be disabled and never falls back to plaintext. Outer proxy TLS uses standard Go TLS/H1 ALPN; inner target TLS retains the browser profile and H2 multiplexing/duplex.
- proxy_ca_file controls proxy trust only; ca_file controls target trust. Explicit roots replace system roots. Session defaults read files once; a request path is reread, omission inherits, and explicit proxy_ca_file=None restores system roots. Direct/HTTP/SOCKS paths ignore default proxy CA settings.
- socks5 resolves locally, preferring the first IPv4 result then IPv6, without retrying all addresses. socks5h delegates hostname resolution to the proxy. IP literals remain IPs; both default to port 1080.
- HTTP proxies use URL credentials for Basic authentication. SOCKS5 supports no-auth or username/password; configured credentials require that method without downgrade. URL-escape credentials, for example `%40` for `@`.
- Session proxy is a default. Omitted request options inherit; proxy=None or empty text selects direct access. HTTP_PROXY, HTTPS_PROXY, ALL_PROXY, and NO_PROXY are not read.
- Proxy address/credentials, proxy roots, browser profile, and target trust isolate pools. Changed CA trust cannot reuse a tunnel created with different trust. Cookies remain target-scoped within the SDK session. The 16-configuration limit still applies.
- Connect/total budgets cover CONNECT and authentication. Cancellation closes unfinished tunnels. Established transport manages shared connections; cancelling one H2 stream does not close others. Session close releases its tunnels.
- Proxy credentials are sent only during proxy authentication, never to the target. Proxy-Authorization and Proxy-Connection target headers are rejected; use URL credentials. Errors redact proxy credentials and arbitrary response reason phrases.
- CONNECT response headers are limited to about 64 KiB and preserve already-read tunnel bytes. This is not a body limit; streaming remains bounded.

SOCKS4, PAC, automatic environment proxies, and proxy rules are unsupported. H2 describes the target protocol inside the tunnel; HTTP/HTTPS proxies themselves require HTTP/1.1 CONNECT, not H2-only CONNECT.

## Native capability requirements

proxy_tunnels enables the optional start proxy string. Omitted/empty means direct; the binding supplies defaults explicitly. Invalid schemes, addresses, and credentials fail before registration. HTTPS proxies additionally require https_proxy_tls and may use proxy_ca_pem; empty selects system roots. Nonempty proxy roots are only valid for HTTPS proxy URLs and never reuse target ca_pem. Go exposes Options.ProxyTLSRootCAs, cloned by NewSession. ABI and existing function signatures are unchanged.

## Verification

An independent loopback TLS/CONNECT/RFC1928/RFC1929 lab drives 14 corresponding tests: four schemes, authentication, overrides, pool/credential isolation, DNS location, HTTP/H1 TLS/H2 TLS, stalls, timeouts/cancellation, 64 MiB transfers, slow consumers, SSE, duplex, and shared tunnel isolation. Separate proxy and target CAs verify trust/hostname errors, overrides, no plaintext fallback, and rejecting invalid roots before registration.

```text
python tests/test_proxy.py
python scripts/test_wheel.py --proxy
```

Source and wheels run on the full native matrix with JSON/log evidence. Core tests separately cover socket cleanup, header bounds, authentication, pre-read bytes, SOCKS address types, and redaction.

## Node.js

new Session({proxy: url}) sets defaults; request proxy=null/empty means direct, omission/undefined inherits. These rules also apply to stream, SSE, and duplex. proxyCaFile maps to Python proxy_ca_file: constructor reads once, request paths reread, undefined inherits, null uses system roots. Target caFile is independent.

Node uses an independently implemented proxy lab and maps the same 14 scenarios. Installed testing disables install scripts and compiler search paths. See the [Node guide](../node/index.md) and [parity](https://github.com/FastTLS/fastls-ffi/blob/main/node/PARITY.md).


---

Source: [FastTLS/fastls-ffi · PROXY.md](https://github.com/FastTLS/fastls-ffi/blob/19c6c57bee4f5663757eda241081d469f62af456/PROXY.md). Reviewed 2026-10-27; source revision `19c6c57bee4f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
