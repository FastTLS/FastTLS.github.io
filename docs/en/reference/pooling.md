# Reusable sessions and connection pools

Session, AsyncSession, and ClientSession own native transport contexts. The language SDK manages cookies, defaults, and redirects. Requests with matching profile, target CA, and proxy configuration share transport within a session. HTTP/1.1 supports keep-alive; HTTP/2 multiplexes requests. Separate Sessions never share connections.

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    first = session.get("https://example.com/a")
    second = session.get("https://example.com/b")
    # Release idle connections; later requests establish new ones.
    session.close_idle_connections()
```

Python merges default headers for every request. Explicit headers do not alter protocol configuration, and the first request's User-Agent, Cookie, or other headers do not become pool defaults.

## Lifecycle and isolation

- Reaching EOF or closing a response permits reuse when the protocol allows it. Closing one H2 response cancels that stream without closing other active streams.
- Session.close cancels owned requests, removes registrations, and closes idle connections; remaining connections are released after active cleanup. Repeated close is harmless; new requests after close fail.
- close_idle_connections affects idle connections only and is directly available on AsyncSession.
- Profile and CA content hashes separate configurations; proxy credentials and proxy CA trust also participate in isolation. Origins are separated by protocol/host/port; there is no cross-origin H2 coalescing.
- Total deadlines include response reading. Protocol discovery and shared H2 connection waits are cancellable. One cancelled waiter does not cancel others; the last waiter leaving cancels shared establishment.

## Bounded resources

The native runtime allows 64 open contexts and 256 open requests. Each context allows 16 transport configurations and each configuration 128 origins. Exceeding limits fails instead of reusing an incompatible configuration. Closing the Session clears configuration/origin registrations; closing idle connections does not.

Each HTTP/1 origin retains up to eight idle connections; this is not an active concurrency limit. H1/H2 idle timeout is 90 seconds. H2 TCP/TLS establishment has a 30-second internal cap and responds to waiter cancellation and session closure.

## C ABI compatibility

ABI remains 1. JSON results must be released with fastls_free:

- `fastls_transport_create()` creates a transport context without application cookie state for current SDKs. Historical `fastls_session_create()` remains for old C clients.
- `fastls_session_close(handle)` idempotently closes the context and its requests.
- `fastls_session_close_idle(handle)` closes idle connections.

The optional session field on fastls_start selects a context; omission/zero retains one-shot C behavior. Session and request handles are different types and cannot be interchanged. Stats include open_sessions and session_pools. Python 0.1.4 requires transport_context_v1 and fastls_transport_create; upgrading the wheel while overriding it with an old DLL is unsupported.

## Verification

Core regressions check H1/H2 reuse, reconnecting after idle close, rejecting closed-session requests, and cancellation isolation. Six real-library pooling tests use independently assigned connection IDs for reuse, profile/CA/session isolation, header isolation, 24 H2 streams with partial cancellation, idle close during active traffic, cleanup, and independent waiter deadlines. Source/wheel and Linux race/300-second checks remain mandatory.

Also see [cookies](cookies.md), [decoding and timeouts](timeouts.md), [uploads](upload.md), and [WebSocket](websocket.md), all of which are implemented.


---

Source: [FastTLS/fastls-ffi · POOLING.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/POOLING.md). Reviewed 2026-10-27; source revision `0f1aaa616e69`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
