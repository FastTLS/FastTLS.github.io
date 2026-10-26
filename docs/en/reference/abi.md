# C ABI v1

The generated fastls.h is authoritative. Functions use the C calling convention:

- fastls_abi_version(): currently 1.
- fastls_transport_create(): added for Python 0.1.4 / Node 0.10.1, creating a transport context without application cookie state. Session close/idle-close and notification functions manage its resources. SDKs submit single-hop requests and implement redirects.
- fastls_session_create/cookies(): retained for historical clients. New SDKs do not use them. Cookie calls on transport contexts fail. The extension is advertised as transport_context_v1 without changing the ABI number.
- fastls_profiles(): canonical profile IDs in a JSON result.
- fastls_stats(): read-only diagnostics.
- fastls_wait() and fastls_session_watch/events/unwatch(): readiness and notifications; see [the notification contract](https://github.com/FastTLS/fastls-ffi/blob/main/NOTIFICATIONS.md).
- fastls_start(data,length): accepts UTF-8 JSON and immediately returns a request handle envelope.
- fastls_info(handle): pending/headers/eof/error state, status, protocol/URL, headers, EOF trailers, match, or error.
- fastls_read(handle,buffer,capacity,&length): nonblocking binary reads. 0=data, 1=pending, 2=EOF, -1=request failure, -2=invalid input/handle.
- fastls_cancel(handle): cancel while retaining the handle for inspection.
- fastls_close(handle): remove and cancel, idempotently.
- fastls_free(pointer): release JSON results; NULL is allowed, foreign pointers and double free are not.

Results are `{"ok":true,"result":...}` or `{"ok":false,"error":"..."}`. Release every returned JSON pointer. Input/read buffers are used only during the call; no Go pointer is returned.

Start fields include url, method, profile, headers, optional trailers, body/body_base64, timeout_ms, disable_redirect, optional ca_pem, and session. Other documented extension fields require matching capabilities; unknown fields are rejected. Input is limited to 1 MiB, decoded inline upload to 512 KiB, open requests to 256, and each read to 1..1 MiB.

One response supports one reader; control operations may be concurrent. Close handles even after completion. Keep the library loaded for process lifetime. Consult [pooling](pooling.md), feature-specific guides, and generated fastls.h; an equal ABI number does not guarantee all extensions.


---

Source: [FastTLS/fastls-ffi · ABI.md](https://github.com/FastTLS/fastls-ffi/blob/19c6c57bee4f5663757eda241081d469f62af456/ABI.md). Reviewed 2026-10-27; source revision `19c6c57bee4f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
