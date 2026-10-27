# Streaming decoding and phase timeouts

Python Session/AsyncSession incrementally decode gzip, deflate (zlib or common raw deflate), Brotli, and Zstandard. `iter_bytes/aiter_bytes` yield decoded bytes through bounded queues without collecting the entire compressed body. Profiles and explicit Accept-Encoding headers are unchanged.

```python
from fastls import Session, Timeout, FastlsTimeoutError

with Session(profile="chrome/156/windows",
             timeout=Timeout(total=120, connect=5, headers=15, read=20)) as session:
    try:
        with session.stream("GET", "https://example.com/large-file") as response:
            print(response.decoded, response.wire_headers.get("content-encoding"))
            for chunk in response.iter_bytes():
                pass  # Process decoded data incrementally
    except FastlsTimeoutError as error:
        print(error.phase)  # connect / headers / read / total
```

## Decoding and limits

- decode_content defaults to True. Set it to False on the session or request to read compressed bytes unchanged; pool identity is unaffected.
- Decoded headers omit Content-Encoding/Content-Length; wire_headers retains parsed original fields and duplicates. decoded identifies the selected view, not proof of complete integrity: read successfully to EOF. HEAD, 204, 304, and identity do not activate decoding.
- Stacked Content-Encoding values decode in reverse order, at most four layers. Unknown encodings raise FastlsDecodeError. Concatenated gzip members are supported. Checksum errors, truncation, and limit violations never count as successful EOF.
- max_decoded_bytes defaults to 256 MiB; accepted positive integers are 1 through 1 TiB. It limits actual decoded output only. Buffered responses retain their 32 MiB decoded-content limit. Raw mode does not apply the decoded-output limit.
- Zstandard uses one decoding thread and a 64 MiB window cap, without external dictionaries. The body queue retains approximately three 64 KiB chunks. Protocol buffers and decoder state are additional; layered decoders have independent buffers, so these limits are not process memory caps.
- Initialization and every decoding layer check cancellation. Headers return without waiting for the compressed body; reading compression headers is subject to body-read timeouts.

Truncation regressions cover an older Brotli reader's premature EOF behavior. The dependency is pinned to v1.2.0 with [unfinished-stream checks](https://github.com/andybalholm/brotli/blob/v1.2.0/reader.go).

## Timeout semantics

A numeric timeout is the entire request deadline, default 30 seconds. `Timeout(total=30, connect=None, headers=None, read=None)` configures phase limits. Python values use seconds, greater than zero and at most 86400; None disables a phase, but total remains required. A request policy replaces the whole session policy; a numeric override clears phase restrictions.

- **connect:** from each hop's start until a usable connection, including discovery, pool wait, DNS, TCP, and TLS. Reuse usually ends this phase immediately.
- **headers:** after the complete request/upload is sent until final headers; 1xx does not finish it. See [write timeouts](upload.md) for upload progress.
- **read:** each native wait for network body data, reset by progress. Consumer pauses do not themselves start a timer, but background prefetch may still time out. Waiting on a full queue does not consume read budget.
- **total:** connection, redirects, decoding, application pauses, and waits. Phase budgets restart per hop; the total deadline does not. Already observed successful EOF remains stable.

FastlsTimeoutError derives from FastlsError and exposes phase, including write. FastlsDecodeError also derives from FastlsError; cancellation/network failures use FastlsError. Per-request cancellation never changes shared H2 socket deadlines.

Phase policies do not split pools. The shared H2 connection retains its 30-second internal establishment cap; a longer connect policy does not enlarge it. Basic decoding tests cover TCP H1/H2. [Proxies](proxy.md), [uploads](upload.md), and [WebSocket](websocket.md) have separate implementations and tests; SDK HTTP/3 is unsupported.

## C ABI and validation

ABI remains 1. Feature discovery includes stream_decode and phase_timeouts. Start options include decode_content, max_decoded_bytes, connect_timeout_ms, headers_timeout_ms, and read_timeout_ms. Zero disables a phase; max_decoded_bytes=0 uses the default. C clients omitting decode_content retain historical body behavior. Info adds decoded, wire_header_values, error_code, and timeout_phase; JSON ownership remains unchanged.

Fifteen real-library tests cover independent compression vectors, stacking, concatenated gzip, raw mode, errors/limits, 64 MiB decoded SHA256, slow consumers, redirects, event-loop responsiveness, and H2 isolation. Vectors use independent standard/Brotli/Zstandard implementations. Source/wheel, race, and 300-second checks remain in CI.


---

Source: [FastTLS/fastls-ffi · STREAMING_TIMEOUTS.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/STREAMING_TIMEOUTS.md). Reviewed 2026-10-27; source revision `0f1aaa616e69`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
