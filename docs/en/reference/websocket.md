# WebSocket: Python, Node.js, and C

RFC6455 ws/wss clients share native message handles across Python sync/async and C. WebSocket is separate from SSE and HTTP/2 duplex.

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    with session.websocket("wss://example.com/chat",
                           headers={"Origin": "https://example.com"},
                           subprotocols=["chat.v1"]) as ws:
        ws.send("你好")               # str -> text; bytes-like -> binary
        message = ws.recv()            # Complete message, returned as str or bytes
        ws.ping(b"health")             # Write completed; this does not prove a pong was received
```

```python
import asyncio
from fastls import AsyncSession

async def main():
    async with AsyncSession(profile="chrome/156/windows") as session:
        async with session.websocket("wss://example.com/chat") as ws:
            await ws.send(b"binary payload")
            message = await ws.recv()

asyncio.run(main())
```

ws_connect() returns a connection directly (await the async form) for manual close/aclose management. Context exit attempts a close handshake. abort()/cancel() immediately discards unread/unsent data and interrupts the connection.

## Options and protocol scope

- Handshakes inherit session profile, headers, target CA, and proxy. Request overrides include profile, headers, params, proxy, and proxy_ca_file; proxy=None means direct. HTTP/HTTPS CONNECT and SOCKS5/local or socks5h/proxy DNS reuse the supported tunnel implementation.
- wss always verifies certificates/hostnames. HTTPS proxy and target roots are independent. Current SDKs use DialWebSocketContext rather than the historical Go constructor.
- Browser profiles select TLS recipes/default headers, but Upgrade advertises only http/1.1 ALPN and removes H2 ALPS. Gorilla manages Upgrade header order. Match records the selected profile, not exact browser equivalence after adaptation. Native websocket.alpn_policy records the adaptation; a server omitting ALPN still uses H1.
- Text/binary/empty messages, incoming fragmentation reassembly, interleaved control frames, automatic pong, explicit ping/pong, and close handshakes are supported. subprotocols accepts up to 16 legal tokens; subprotocol is the server choice. Unoffered subprotocols/extensions are rejected.
- No permessage-deflate/other compression, H2/H3 Extended CONNECT, reconnect/replay, handshake redirects, or environment proxies. Handshake responses are limited to 64 KiB.
- Python 0.1.4 / Node 0.10.1 select cookies from the SDK Session jar. ws/wss uses corresponding http/https scope, Secure, and expiry rules. Explicit Cookie, including empty, replaces automatic sending. Disabled cookies prevents automatic reads/writes while allowing manual headers. Cookies from valid 101 and ordinary failed HTTP responses update the original URL's jar; invalid 101/TLS failures do not. Redirects are not followed. New SDKs require transport_context_v1; historical native cookie markers apply to old clients only.
- The caller supplies Origin. Connection, Upgrade, Sec-WebSocket-*, framing, and proxy authentication headers are managed by the library and cannot be overridden.

## Resources and concurrency

- max_message_bytes defaults to 1 MiB, configurable from 1 to 16 MiB, measured in UTF-8 bytes/reassembled message size. Overflow, invalid UTF-8, and protocol errors terminate the connection. Outbound data has the same limit; ping/pong/close payloads have a 125-byte limit.
- Message APIs buffer bounded complete messages, not arbitrary file streams. Native state may retain one queued message, one being read/waiting for enqueue, and one being delivered through C chunks; sending accepts one message. Python recv additionally holds its current message. Stack, allocator, OS, and application buffers are additional.
- Backpressure reaches the network; queued data can also delay later control frames. Closing unblocks enqueue. HTTP and WS share the 256-open-handle limit; always close connections.
- One reader and one writer may operate concurrently. Overlapping recv or send/ping/pong fails rather than queueing implicitly. Serialize application writes. Native automatic pong/close may proceed alongside application sending.
- Python adds no network worker threads. Sync uses fastls_wait; async uses one notification connection per session, with explicit poll available. Cancelling one connection leaves other owned WS/HTTP requests intact; closing the session interrupts all of them.

## Timeouts and close

Python handshake_timeout=30 covers connection/proxy/TLS/Upgrade; read_timeout=None is unlimited by default and, when set, budgets each message read. write_timeout=30 budgets each message write. Values use seconds; HTTP total timeout is not a WS lifetime limit. Read/write timeouts terminate the connection and raise FastlsTimeoutError with phase handshake/read/write. Node uses corresponding millisecond options.

close_timeout=1, at most 60 seconds, bounds the entire close handshake before abort. close(code=1000,reason='') accepts valid send codes and at most 123 UTF-8 reason bytes. Normal received close raises WebSocketClosed with code/reason; the connection retains close_code/close_reason. No close frame defaults to 1006; native errors still propagate as FastlsError.

ping() waits only for sending. websocket.pongs and last_pong_base64 expose received pongs; automatic heartbeat/RTT policies are not provided.

## C ABI v1

websocket_v1 advertises messages; websocket_cookies_v1 is retained for historical native-cookie clients. Generated fastls.h declares:

```c
char *fastls_ws_start(char *json, size_t length);
int fastls_ws_send(uint64_t handle, int opcode, void *data, size_t length);
int fastls_ws_read(uint64_t handle, void *buffer, size_t capacity,
                   size_t *length, int *opcode, int *end);
```

Start uses the normal JSON envelope, released with fastls_free. Inputs are defined by WebSocketInput in internal/bridge/websocket.go, using millisecond budgets.

Send opcodes: 1=text, 2=binary, 8=close, 9=ping, 10=pong. Return 0 means copied/accepted; 1 means nothing consumed, wait writable and retry; negatives are errors. Acceptance is not network completion: inspect write_pending and wait(handle,4,...). Close payload is a two-byte network-order status plus UTF-8 reason.

Read capacity is 1..65536. Results are 0=data, 1=pending, 2=EOF, negative=error. Each chunk includes message opcode; end=1 marks message completion, including empty messages. Message end is not connection EOF. Native control frames are not delivered through this reader.

Reuse info/wait/cancel/close and notifications; HTTP read/write cannot operate on WS handles. C callers coordinate one reader/one sending sequence and concurrent lifetime. See examples/c/websocket.c. Implementation uses pinned [Gorilla v1.5.3](https://pkg.go.dev/github.com/gorilla/websocket@v1.5.3) with extra UTF-8, negotiation, size, and lifecycle checks; its test fixture writes frames independently.

Node Promise APIs share the JavaScript HTTP jar and support cookieMode:manual. Valid 101/ordinary HTTP failure cookies are stored; invalid 101, TLS failures, and manual mode do not update it automatically.


---

Source: [FastTLS/fastls-ffi · WEBSOCKET.md](https://github.com/FastTLS/fastls-ffi/blob/19c6c57bee4f5663757eda241081d469f62af456/WEBSOCKET.md). Reviewed 2026-10-27; source revision `19c6c57bee4f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
