# Find an example by task

Use the Go guide for Go interfaces. The detailed feature guides primarily show Python and explain Node equivalents where applicable.

## Requests, JSON, and files

[Complete Go request](../fastls/index.md) · [Go request options](../fastls/session.md) · [Python sync/async and files](../python/index.md) · [Node Promise and files](../node/index.md). See [request and response options](../reference/requests.md) for encoding details. Check language-specific exclusivity rules for JSON, forms, and raw bodies.

## Cookie sessions and proxies

Reuse a Session after login rather than creating one for every request. A cookie jar does not implement application authentication or CSRF handling. See [cookies and headers](../reference/cookies.md), [pooling](../reference/pooling.md), and [HTTP/HTTPS/SOCKS proxies](../reference/proxy.md). Configure proxy and target CA trust separately.

## Transfers, concurrency, and cancellation

Stream large downloads to disk to avoid buffered response limits. Upload producers must handle cancellation and leave owned files correctly closed. See [streaming and timeouts](../reference/timeouts.md), [uploads](../reference/upload.md), and [H2 duplex](../reference/duplex.md). Custom Node Promise producers should accept an AbortSignal; arbitrary I/O cannot be forcibly interrupted by the language.

## SSE and WebSocket

[SSE](../reference/sse.md) covers parsing, last-event-id, and retry; the application decides whether to reconnect. [WebSocket](../reference/websocket.md) covers limits, close codes, one reader/one writer, and independent timeout phases. `example.com/events` and `/chat` are placeholders, not runnable protocol services.
