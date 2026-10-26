# Streaming uploads

Python sync/async sessions send request bodies incrementally without changing browser profile selection. H1 uses chunked encoding; H2 uses DATA frames, without requiring a precomputed total length.

```python
from fastls import Session, AsyncSession, Timeout

with Session(profile="chrome/156/windows") as session:
    with open("large.bin", "rb") as file:
        response = session.post("https://example.com/upload", data=file,
                                timeout=Timeout(total=300, write=20, headers=15))

async def blocks():
    for _ in range(1024):
        yield b"x" * 65536

async def upload():
    async with AsyncSession(profile="chrome/156/windows") as session:
        return await session.post("https://example.com/upload", data=blocks(),
                                  timeout=Timeout(total=300, write=20))
```

Bodies may be binary files, byte iterators, async byte iterators, or bytearray/memoryview chunks. Oversized chunks are split into 64 KiB submissions; empty chunks are skipped. Bytes and UTF-8 strings above 512 KiB use the upload channel automatically; smaller bodies retain inline JSON transport. The caller closes files. Async iterators require AsyncSession. Synchronous read/next runs on the calling thread, including the event-loop thread; use async producers for slow I/O. A native timeout cancels the network while a synchronous next is blocked, but Python cannot report it until next returns.

The bridge retains at most one 64 KiB chunk including unconsumed transport bytes. A full queue returns pending immediately for the SDK to wait/retry, without per-request Python threads or retaining C caller pointers. The current Python chunk, protocol/TLS/kernel buffers, and user allocations are additional. Stats expose buffered_upload_bytes.

Cancellation, closure, producer errors, and timeouts stop uploads and release handles. Early 3xx/4xx/5xx stops production and returns the response. Early 2xx before upload completion raises FastlsError mentioning duplex and closes the request rather than silently truncating or waiting for total timeout. Use [H2 duplex](duplex.md) for simultaneous directions. Upload iterators receive close/aclose on completion or abort; file ownership does not transfer.

One-shot bodies are not replayable: 307/308 returns the redirect response. SDK 301/302/303 rules may discard the body and convert to GET; upload_discarded distinguishes this from an early duplex response. The upload channel owns framing: Content-Length/Transfer-Encoding is rejected before registration. Unknown-length streaming is supported; fixed-length streams and automatic retries are not.

## Write timeout

`Timeout.write` uses seconds, default None. It starts when a connection is obtained, resets when transport reads upload data, and transitions to headers after complete sending. It includes producer stalls and backpressure from a peer that stops reading. It is neither total upload duration nor proof the server persisted data. Enqueueing alone does not reset it.

Timeout raises FastlsTimeoutError with phase=write. total still covers the exchange through response consumption. H2 cancels the request without modifying a shared socket deadline. The library must advertise stream_upload and write_timeout.

## C ABI v1

Start accepts stream_body=true, mutually exclusive with body/body_base64; write_timeout_ms=0 disables the write budget.

```c
int fastls_write(uint64_t handle, void *buffer, size_t length, int end);
```

Each length is at most 65536; end is 0 or 1, and zero length requires end=1. Return 0 means the entire chunk was copied and the caller buffer can be reused; 1 means backpressure with no consumption; 2 means uploading has ended, so stop sending and read the response. -1 is failure, -2 invalid input/handle. EOF can accompany a last chunk or an empty submission. No writes follow accepted EOF. Calls never wait for the network or partially consume a chunk.

## Verification

Sixteen real-library tests cover 64 MiB sync/async SHA256 uploads, files/large bodies, empty/large chunks, slow receivers, cancellation and H2 isolation, producer exceptions, early rejection, redirects, total/write deadlines, and progress resets. Source and wheels run across the native matrix; queue/copy/backpressure/EOF/cancellation regressions run under race. Existing 300-second checks remain. Evidence is stored as stability-upload JSON artifacts.


---

Source: [FastTLS/fastls-ffi · STREAMING_UPLOAD.md](https://github.com/FastTLS/fastls-ffi/blob/19c6c57bee4f5663757eda241081d469f62af456/STREAMING_UPLOAD.md). Reviewed 2026-10-27; source revision `19c6c57bee4f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
