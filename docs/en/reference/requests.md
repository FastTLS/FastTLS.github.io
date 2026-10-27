# Request and response options

Python Session and AsyncSession share the request options used by `request/get/post/stream`. Browser profile selection remains `profile="chrome/156/windows"`. Encoding uses the Python standard library; cookie validation has its separate `publicsuffixlist` dependency.

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    response = session.get("https://example.com/search", params={"q": "中文", "tag": ["a", "b"]})
    response.raise_for_status()
    response = session.post("https://example.com/api", json={"enabled": True})
    response = session.post("https://example.com/upload", data=b"payload",
                            trailers={"X-Checksum": ["verified"]})
    response = session.post("https://example.com/form", data=[("tag", "a"), ("tag", "b")])
    with open("archive.bin", "rb") as upload:
        response = session.post("https://example.com/upload", data={"description": "附件"},
                                files={"file": ("archive.bin", upload, "application/octet-stream")})
```

## Queries and bodies

- `params` accepts a mapping, a list/tuple of pairs, or an encoded ASCII query string without `#`. It appends to the existing query while preserving its encoding and the URL fragment; fragments are not sent. Sequence values produce repeated keys, `None` values are omitted, empty strings remain, and booleans become `True`/`False`. Keys are str/bytes; scalar values are str/bytes/numbers. Unicode uses UTF-8, spaces become `+`. Pair generators are unsupported.
- `json` uses strict UTF-8 JSON without ASCII escaping or NaN/Infinity. Explicit `json=None` sends `null`; omitting it produces no JSON body. Combining it with non-None `data` or `files` fails immediately, unlike Requests' implicit body selection.
- Mapping or pair-list/tuple `data` encodes as `application/x-www-form-urlencoded`, with the same repeated-key/Unicode/empty-value rules. An empty list is an empty form. Strings, bytes, binary files, and byte iterators remain raw bodies; a list of byte chunks is not a form.
- JSON and forms are encoded in Python memory, not incrementally. Above the native inline threshold they transfer through the upload channel. Use files/iterators for large raw data. Buffered responses remain limited to 32 MiB.
- JSON/form Content-Type defaults apply only if neither the session nor request supplies one. The encoder controls length and transfer framing: explicit Content-Length or Transfer-Encoding is rejected for encoded bodies. Raw `data` retains its own rules.

## Multipart files

- `files` accepts a mapping or `(field, descriptor)` pairs, allowing duplicate fields. A descriptor is bytes, a binary file, or `(filename, body[, content_type])`. MIME type is inferred from the name, otherwise application/octet-stream. `filename=None` omits the filename parameter.
- `data` can supply regular fields alongside files. File reads are at most 64 KiB, without reading the full file, seeking, measuring its length, or creating temporary files. Async calls still read synchronous files on the event-loop thread; prepare slow disk access separately.
- The encoder generates the boundary and exclusively manages Content-Type; an explicit conflicting header fails. Field names, filenames, and types reject control characters. Four-element per-part headers, async files, file-body generators, and multipart duplex are unsupported.
- The caller owns files and closes them after success, failure, or cancellation. Reads start at the current position; reopen/seek explicitly before another upload. The encoder is single-use. Read errors propagate and release the request.
- One-shot bodies are never automatically replayed for 307/308. The SDK applies method conversion/body removal for 301/302/303. Inspect the response and start a new request to upload again. Buffered JSON/forms follow buffered redirect rules until they exceed the inline threshold and become streaming bodies.
- Synchronous manual `duplex()` supports `params`, but body data is sent through `send()`. Async duplex accepts existing data and JSON/forms with redirects disabled; multipart is unsupported.

## Responses

`http_version` records the final protocol, such as HTTP/1.1 or HTTP/2.0; `url` is the final redirected URL. `trailers` provides the same case-insensitive, multi-value access as headers and is complete after successful EOF.

`encoding` starts from Content-Type's charset or UTF-8 and can be changed before reading `.text`. Invalid bytes are replaced; unknown encodings raise LookupError rather than triggering detection. `.json()` parses original bytes independently and retains JSON UTF/BOM handling.

Python `ok` means status below 400. `raise_for_status()` raises FastlsHTTPError for 400–599 and otherwise returns None. The exception exposes response and status_code; its message includes only the status. Async buffered responses share these helpers. For streaming, inspect status before reading and still close the response through context management or `aclose()`.

This convenience API does not promise full Requests compatibility, environment proxies, retries, one-shot replay, or encoding detection.

## Node.js

Node provides `params/json/form/files`, streaming multipart, encoding, and `raiseForStatus()` through Promise APIs. Raw input uses `body`; forms use explicit `form`. File readers implement `read(maxBytes, signal)` and remain caller-owned. See the [Node guide](../node/index.md) for types, charsets, and MIME differences, and [PARITY.md](https://github.com/FastTLS/fastls-ffi/blob/main/node/PARITY.md) for behavioral coverage. [WebSocket](websocket.md) is implemented separately.


---

Source: [FastTLS/fastls-ffi · REQUEST_OPTIONS.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/REQUEST_OPTIONS.md). Reviewed 2026-10-27.
