# Multi-value headers and session cookies

Starting with Python 0.1.4 / Node 0.10.1, each language SDK owns application cookies. Python uses http.cookiejar plus publicsuffixlist validation; Node uses tough-cookie. Native `transport_context_v1` owns pools and request resources without a cookie store. Historical C cookie APIs remain for older clients.

Profiles in one SDK Session share its jar; different sessions and language processes do not. SDK redirects store Set-Cookie before choosing cookies for the next URL, sharing one total deadline. Closing a Session clears its cookies and releases transport resources. Cookies are not persisted to disk.

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    response = session.get("https://example.com/login")
    print(response.headers.get_list("set-cookie"))
    print(session.cookies.get_dict("https://example.com/account"))

    session.cookies.set("token", "value", url="https://example.com", path="/", secure=True)
    session.cookies.delete("token", url="https://example.com", path="/")
    session.cookies.clear()
```

## Response headers

Python `response.headers` is a read-only, case-insensitive Mapping. Indexing and `get()` return the first value; `get_list()` returns an independent list of all values, or an empty list for a missing field. `multi_items()` preserves duplicate `(name, value)` entries.

Set-Cookie and Link are not split on commas or the historical `/,/` separator. Each parsed value is preserved, without promising original field-name case, cross-field wire order, or raw packet bytes. Trailers provide the same representation after successful EOF. Only final response headers are exposed here; intermediate redirect cookies still update the jar.

Unlike older development dict headers, access is now case-insensitive and immutable. Use `get_list('Set-Cookie')` rather than single-value access to retrieve every cookie field.

## Cookie behavior

- Each Set-Cookie is processed using domain, host-only, path, Secure, Max-Age, and Expires rules. SDKs treat localhost and loopback IPs as trusted local origins, allowing Secure cookies on their HTTP requests; other HTTP hosts do not receive them. Python's publicsuffixlist and Node's tough-cookie reject public-suffix domain cookies.
- Redirects update the jar before the next hop, including when following is disabled. Cross-host redirects select cookies permitted for the destination.
- An explicit Cookie header, including an empty value, overrides automatic sending for the chain rather than merging with stored cookies. Responses still update storage. SDK sensitive-header rules strip manual headers on cross-origin redirects.
- Python `get_list(url)` returns sendable `{name,value}` entries, retaining same-name cookies at distinct paths. `get_dict(url)` and `get(name,url=...)` prefer the longest matching path. This is a sending view, not a full-attribute jar export.
- `set(name,value,url=...,path=...,domain=...,secure=...,http_only=...,max_age=...,expires=...)` writes a cookie. Default path is the URL directory; no domain means host-only. Expires accepts RFC3339 such as `2100-01-01T00:00:00Z`. Positive max_age overrides expires; zero/negative deletes; omission uses expires or session lifetime.
- Deletion requires the original URL/path/domain scope. `clear()` empties the jar while retaining pools; `close_idle_connections()` releases idle connections without clearing cookies.
- `cookies=False` disables automatic receipt/sending but permits an explicit Cookie header. Manual set fails when disabled. Operations are short and synchronous, also on AsyncSession.

Manual inputs validate names, values, scopes, and expiration. Combined name/value/domain/path text is limited to 4096 bytes; positive max_age is at most 2147483647 seconds. The jar does not implement browser SameSite request context, partitioned cookies, or browser eviction quotas. Tolerant parsing and prefix checks need not match across the two libraries. HttpOnly does not prevent application reads. Full requests cookie compatibility is not promised.

## Native boundary and validation

Core Response exposes HeaderValues, Trailer, Protocol, and FinalURL; historical single-value Headers, including its old Set-Cookie concatenation, remains compatible. ABI v1 info adds header_values, trailer_values, protocol, and final_url without changing existing headers.

Historical `fastls_session_cookies(handle,data,length)` accepts up to 16384 bytes of UTF-8 JSON and returns an envelope released with fastls_free. Actions are get/set/clear/configure; get/set require absolute credential-free HTTP(S) URLs. New transport handles reject this API; upgrade the SDK and library together.

Thirteen real-library cookie tests cover H1/H2 headers, scope, replacement/deletion, expiry, redirects, manual overrides, session/profile boundaries, disabled storage, concurrent updates, early headers, and invalid input. SDK-specific tests verify suffix rejection, clear/update synchronization, absence of native cookie storage, and cleanup after redirect errors. Source and wheel suites run across the native matrix with existing network, pooling, 64 MiB, race, and 300-second checks retained.


---

Source: [FastTLS/fastls-ffi · COOKIES_HEADERS.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/COOKIES_HEADERS.md). Reviewed 2026-10-27.
