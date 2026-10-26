# HTTP/2 full duplex

Python can receive a response while uploading, using the same browser profiles. SDK and native library must match; the library advertises duplex_h2 and retains ABI v1.

## asyncio

```python
from fastls import AsyncSession, Timeout

async def exchange(url, outgoing, consume):
    async with AsyncSession(profile="chrome/156/windows") as session:
        async with session.stream(
            "POST", url, data=outgoing, duplex=True,
            timeout=Timeout(total=300, write=20, read=20),
        ) as response:
            async for chunk in response.aiter_bytes():
                await consume(chunk)
```

outgoing may be an async byte iterator. The response returns when headers arrive while the upload task continues; both directions share the session lifecycle. There are no additional Python worker threads or Go-to-Python callbacks. Synchronous reads/iterators still execute on the event-loop thread; slow producers should be asynchronous.

`await response.wait_upload()` waits for the producer to finish and native acceptance of upload EOF, not server receipt or processing. Consume the response concurrently to prevent bounded queues from deadlocking each other. `await session.post(..., duplex=True)` also works but buffers the response with a 32 MiB limit.

## Synchronous manual exchange

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    with session.duplex("POST", "https://example.com/exchange") as exchange:
        exchange.send(b"hello")
        response = exchange.response
        chunks = response.iter_bytes()
        first = next(chunks)
        exchange.send(b"next")
        exchange.finish_upload()
        for chunk in chunks:
            consume(chunk)
```

The caller schedules send/read operations; this API does not accept data. send waits on backpressure, so large sends can block if the response is not consumed. Prefer asyncio for sustained bidirectional traffic. Only one response reader is permitted, and byte chunks are not message boundaries. Synchronous post/stream with duplex=True fails with guidance to use Session.duplex().

## Lifecycle and scope

- Fingerprinted H2 only. H1, unfingerprinted standard transport, and H3 fail before submission to the HTTP transport, although TLS negotiation may already have occurred. Proxy tunnels can carry target H2 duplex; see [proxy limits](proxy.md).
- Upload EOF closes only the request direction. **Response EOF ends the exchange** and cancels unfinished upload; sending after response completion is unsupported.
- Duplex does not follow redirects automatically. 3xx/4xx/5xx stops async uploading and returns the response without replaying rejected data. Normal upload behavior is unchanged.
- Response/session close, context exit, cancelled reading, or timeout cancels the native request and producer. Async aclose waits for producer cleanup. Producer exceptions propagate to readers. Producers must cooperate: synchronous blocking code or coroutines ignoring cancellation cannot be forcibly terminated.
- write remains active for unfinished upload after response headers, independently of read. headers measures only waiting after the complete request is sent. Use total to bound the entire exchange; see [upload](upload.md) and [timeouts](timeouts.md).

The upload bridge retains at most 64 KiB; download retains three 64 KiB chunks. Stack/TLS/kernel buffers and caller objects are additional. Both directions apply backpressure without unbounded request/response queues.

## C ABI

Start requires duplex=true together with stream_body=true and disable_redirect=true. Use fastls_write for chunks/EOF, info for headers, and read for response bytes. Writing remains possible after headers. Each direction permits one producer/consumer; control/cancel operations may run concurrently. See [write results and ownership](upload.md).

## Verification and Node

Thirteen real-library tests cover early response, half-close, 64 MiB hashes in both directions, queue limits, slow consumption, synchronous exchange without new threads, late producer errors, cancellation/H2 isolation, closure, independent phase timeouts, gzip, rejection/redirects, response EOF, and unsupported protocols. Source/wheel tests run across the native matrix; blocked-upload cleanup and connection flow-control regressions run under Linux race.

Node supports stream with duplex/body and manual session.duplex(), send(), finishUpload(), response.waitUpload(), and async cleanup. SSE/duplex combinations are supported. The 13 duplex, 23 SSE, and 20 notification cases are included in the full 231-test suite for source and both installed layouts. See the [Node guide](../node/index.md) and [parity contract](https://github.com/FastTLS/fastls-ffi/blob/main/node/PARITY.md).

Mixed duplex soak tests verify continued traffic after many cancellations on a shared connection. Handling DATA for cancelled streams must preserve local connection accounting while returning the corresponding peer credit; double crediting can stall unrelated streams. This regression remains under flow-control unit and race checks.


---

Source: [FastTLS/fastls-ffi · DUPLEX.md](https://github.com/FastTLS/fastls-ffi/blob/19c6c57bee4f5663757eda241081d469f62af456/DUPLEX.md). Reviewed 2026-10-27; source revision `19c6c57bee4f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
