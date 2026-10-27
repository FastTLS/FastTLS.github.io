# Python / Node.js server-sent events

Sync and asyncio sessions provide session.sse(method, url, ...) with browser profiles, H1/H2 pooling, cookies, decoding, timeouts, and cancellation.

```python
from fastls import Session, Timeout

with Session(profile="chrome/156/windows") as session:
    with session.sse("GET", "https://example.com/events",
                     timeout=Timeout(total=3600, read=45)) as events:
        for event in events:
            print(event.event, event.id, event.data)
```

```python
from fastls import AsyncSession, Timeout

async def receive(url):
    async with AsyncSession(profile="chrome/156/windows") as session:
        async with session.sse("POST", url, data='{"stream":true}',
                               headers={"Content-Type": "application/json"},
                               timeout=Timeout(total=3600, read=45)) as events:
            async for event in events:
                if event.data == "[DONE]":
                    break
                await consume(event)
```

`[DONE]` is ordinary data: the application decides whether to stop. event.json() parses JSON and raises JSONDecodeError for invalid input. ServerSentEvent is immutable, with data, event, id, and optional retry; the default event type is message.

Use context management so early exit releases the response. events.response exposes status, headers, and match. Each stream permits one consumer; do not read its underlying response body concurrently.

## Parsing

The incremental parser follows [WHATWG event-stream interpretation](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation). It decodes UTF-8 with U+FFFD replacement, removes only an initial BOM, and handles arbitrary chunk splits, CR/LF/CRLF, multi-line and empty data, comments, unknown fields, and event types.

A blank line commits an event; EOF does not commit an unfinished event. id persists, empty id resets, and NUL-containing ids are ignored. last_event_id updates when a complete block ends, including id-only blocks; an incomplete trailing id is not committed.

events.retry stores the latest valid server hint in milliseconds, initially None. event.retry applies to the current block only. Only ASCII decimal digits are accepted; values above 2147483647 milliseconds are capped to avoid integer/timer overflow.

Normal responses require HTTP 200 and a single Content-Type of text/event-stream, allowing MIME parameters but always using UTF-8. HTTP 204 is an empty stream. Other statuses and invalid/duplicate content types fail. Compression uses normal incremental decoding/integrity checks. Compressed bytes with decoding disabled are rejected; checksum errors never count as normal completion.

Default headers are Accept: text/event-stream and Cache-Control: no-cache, overridable at request level. Other session defaults remain.

## Manual recovery and timeouts

One call is one request: **no automatic reconnection or replay**. Save last_event_id and pass last_event_id=saved_id on a new call; it sets Last-Event-ID and initializes parser state. NUL/CR/LF are rejected; explicit empty text is supported. Retry count/delay, POST replay safety, and event deduplication belong to the application.

Session total defaults to 30 seconds. For long streams, set a policy such as Timeout(total=3600, read=45). Total must be positive and at most 24 hours; None/unlimited is unsupported. read measures network stalls, and comment heartbeats count as progress without resetting total. Session closure, read cancellation, events.cancel(), context exit, or await events.aclose() cleans up the request.

AsyncSession.sse(..., data=source(), duplex=True) combines upload and SSE over H2; see [duplex](duplex.md) for end-of-direction and exception rules. Sync SSE accepts regular/streamed bodies, while manual synchronous bidirectional exchange uses Session.duplex.

## Memory and verification

Parsing is demand-driven without a background event queue. max_event_bytes defaults to 1048576 and accepts 1..67108864. It separately bounds raw line bytes and accumulated UTF-8 data including inserted newlines. Overflow closes the request with FastlsError. IDs, event type, current chunks, and string-decoding overhead are additional; the value is not a process memory limit. Native buffers remain bounded, and the full stream may exceed the buffered 32 MiB cap.

Twenty-three tests cover byte-by-byte split vectors, UTF-8/BOM/line endings, id/retry blocks, limits/large integers, real H1/H2, gzip/errors, 204/type rejection, POST/resume, early events, H2 cancellation isolation, closure, heartbeat/timeouts, 40 MiB stream hashes/backpressure, and duplex combinations. Source and wheel checks run across the native matrix.

Node uses await session.sse() and async iteration. Options are maxEventBytes, lastEventId, and millisecond timeoutMs; state is lastEventId and explicit cleanup is closeAsync(). All 23 corresponding cases are included in the current 231-test suite for source and both installed layouts. See [Node](../node/index.md) and [parity](https://github.com/FastTLS/fastls-ffi/blob/main/node/PARITY.md).

SSE is a language convenience API, with no new C symbols or ABI version. It does not implement a browser EventSource object, automatic reconnection, or WebSocket.


---

Source: [FastTLS/fastls-ffi · SSE.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/SSE.md). Reviewed 2026-10-27; source revision `0f1aaa616e69`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
