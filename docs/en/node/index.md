# Fastls Node.js SDK

Node.js 22+ bindings for Fastls C ABI v1, with Promise APIs, TypeScript declarations, ESM, and CommonJS. This guide covers **0.10.2**.

H1/H2, streaming uploads/downloads, duplex, SSE, WebSocket, session cookies, and HTTP/HTTPS/SOCKS proxies are supported. Go performs network I/O through Koffi in the current process; Python and RPC services are unnecessary.

Only the Node main thread is supported, not worker_threads, Electron, Bun, or browsers. Certificates are verified by default. A generated identity is not proof of complete browser equivalence.

[Behavioral parity](https://github.com/FastTLS/fastls-ffi/blob/main/node/PARITY.md) · [Publishing](https://github.com/FastTLS/fastls-ffi/blob/main/node/NPM_RELEASE.md) · [Current delivery status](https://github.com/FastTLS/fastls-ffi/blob/main/node/NEXT_PHASE.md)

## Installation and first request

Install the stable release:

```sh
npm install @fastls/fastls@0.10.2
```

The main package installs the matching native optional dependency. Keep optional dependencies enabled. Platforms are Windows x64, Linux glibc x64/arm64, and macOS x64/arm64; musl and other architectures have no bundled package. Minimum OS/runtime requirements are recorded in native/manifest.json.

There are no Fastls build/download install scripts; installed users need no Go/Python/C compiler or FASTLS_LIBRARY. Koffi also uses platform-native components.

```js
import { Session } from '@fastls/fastls';
// CommonJS: const { Session } = require('@fastls/fastls');

const session = new Session({ profile: 'chrome/156/windows', timeoutMs: 30_000 });
try {
  const response = await session.get('https://example.com', {
    headers: { 'User-Agent': 'my-client/1.0' },
    signal: AbortSignal.timeout(5_000),
  });
  response.raiseForStatus();
  console.log(response.status, response.url, response.httpVersion, response.text());
} finally {
  await session.closeAsync();
}
```

Later snippets assume an open session. consume/produceBytes and similar names are application helpers. Close sessions and unconsumed responses. See [development](https://github.com/FastTLS/fastls-ffi/blob/main/node/DEVELOPMENT.md) for source builds, not ordinary installation.

## Setting browser request headers

The default `chrome/156/windows` profile used by Python 0.1.5 / Node 0.10.2 does not supply default values for `Accept-Encoding`, `Accept-Language`, or `Priority`. This example adds them explicitly; other profiles may have different defaults.

```js
import { fetch } from '@fastls/fastls';

const response = await fetch('https://tls.peet.ws/api/all', {
  profile: 'chrome/156/windows',
  headers: {
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Priority': 'u=0, i',
  },
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
console.log(await response.json());
```

Adjust `Accept-Language` to your application's language preferences. `Priority` also depends on the request context; this example is not a universal browser template. Header ordering only arranges existing fields and does not generate their values. Automatic gzip/deflate/br/zstd decoding does not automatically advertise them in `Accept-Encoding`. Explicit header values override profile defaults; reusable sessions can also configure these through Session `headers`.

## Migrating from Node fetch

The fetch adapter follows common Node fetch usage while adding fingerprint, proxy, and certificate options:

```js
import { fetch } from '@fastls/fastls';

const response = await fetch('https://tls.peet.ws/api/all', {
  profile: 'chrome/156/windows',
  headers: new Headers({ Accept: 'application/json' }),
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) throw new Error(`HTTP ${response.status}`);
console.log(await response.json());
```

Inputs include strings, URL, Request, Headers, FormData, URLSearchParams, Blob, bytes, and readable bodies. Streaming requests use duplex:'half'; one-shot 307/308 bodies are not replayed. Headers return a standard Response with async text/json/arrayBuffer, a Web ReadableStream body, and 200–299 ok. Consume the body once; cancel an unused body explicitly. Read-only match/httpVersion metadata is added.

Top-level fetch does not persist cookies and closes temporary resources after EOF, cancellation, abort, or native timeout. Use session.fetch for cookie/connection reuse and closeAsync afterward. Configure library/caFile at Session construction. HTTP errors return responses. redirect accepts follow/manual/error, with maxRedirects default 30.

This is not a browser: CORS, caching, automatic authentication, referrer, integrity, and keepalive policies are not implemented. Explicit cache/credentials/integrity/keepalive/mode/referrer/referrerPolicy fail. Verification cannot be disabled. Node http/https Agent, dispatcher, and Axios options are unsupported. Use millisecond timeoutMs or AbortSignal.

Existing request/stream/duplex/sse/websocket APIs retain phase timeouts, raw bytes, trailers, and explicit resource control. JavaScript owns cookies, defaults, and redirects; native code owns I/O, fingerprints, certificates, and pools. Historical C cookie APIs are not used by this SDK.

## Requests and responses

- await request(method,url,options) and get/post/put/patch/delete/head/options return a fully buffered SDK Response.
- Request options include profile, headers, trailers, params, json, form, files, body, timeoutMs, allowRedirects, maxRedirects, signal, proxy, proxyCaFile, decodeContent, maxDecodedBytes, and duplex. Session additionally supports library, caFile, cookies, and notifications. Public TypeScript declarations are authoritative.
- body accepts strings, Buffer/Uint8Array, sync/async byte iterators, Node Readable, or an AbortSignal-aware producer factory. Strings/bytes above 512 KiB automatically stream.
- timeoutMs is an integer or {total,connect?,write?,headers?,read?}, each 1..86400000 milliseconds; total defaults to 30000. Numeric request overrides clear phase limits; structured overrides replace the whole policy.
- Session/request headers merge case-insensitively, with explicit request values including empty text winning.
- SDK Response exposes status, ok, headers, wireHeaders, decoded, match, httpVersion, url, trailers, content:Buffer, and synchronous text()/json().

**SDK Response.ok means status below 400**, including 302/304, unlike the standard fetch Response's 200–299 rule. raiseForStatus() throws FastlsHTTPError only for 400–599, retaining response/status with a status-only message. Inspect streaming status before reading and still close it.

encoding comes from Content-Type or utf-8 and is mutable. text replaces bad bytes and rejects unknown charsets. Latin-1 maps all bytes directly; other names follow Node TextDecoder's WHATWG labels without guessing. json parses original bytes independently with UTF-8/16/32 and BOM support; JSON numbers retain JavaScript precision limits.

4xx/5xx returns a response; parameter/network/TLS/native errors throw. Headers.get returns the first value or undefined; getAll preserves duplicates without comma splitting. entries/default iteration returns first values; multiItems returns all. listProfiles returns canonical IDs. stats covers the loaded native instance, not only one Session.

Unknown profiles fail. match describes selection, not browser equivalence. Arbitrary valid methods use request(); all common helpers are available. Header values are strings; trailer values are strings or readonly string arrays, requiring request_trailers. url/httpVersion describe the final response. Buffered responses already reached EOF and include final trailers; streams update them after EOF, not early close.

## Query parameters and encoded bodies

```ts
const response = await session.get('https://example.com/search?old=a%20b#fragment', {
  params: [['q', '中文'], ['tag', ['a', 'b']], ['empty', '']],
});
response.raiseForStatus();
await session.post('https://example.com/api', { json: null });
await session.post('https://example.com/form', { form: { tag: ['a', 'b'], enabled: true } });

// The caller owns FileHandle; adapt read, start at the current position, and close it afterward.
const file = await open('/path/to/archive.bin', 'r'); // import { open } from 'node:fs/promises'
try {
  await session.post('https://example.com/upload', {
    form: { description: '附件' },
    files: { file: ['archive.bin', {
      async read(maxBytes, signal) {
        signal.throwIfAborted();
        const buffer = Buffer.allocUnsafe(maxBytes);
        const { bytesRead } = await file.read(buffer, 0, maxBytes, null);
        return buffer.subarray(0, bytesRead);
      },
    }, 'application/octet-stream'] },
  });
} finally { await file.close(); }
```

- params/form accept plain objects, Maps, or pair arrays. Array values repeat keys; null/undefined is omitted; empty strings remain. Booleans use True/False, Unicode UTF-8, spaces '+'. Keys may be strings/Uint8Array; values strings/Uint8Array/finite numbers/booleans. Nonfinite query/form numbers are rejected, unlike Python.
- params also accepts encoded ASCII without '#', retaining existing query/fragment; fragments are not sent.
- json accepts strict values, plain objects, and arrays. NaN/Infinity, undefined, bigint, sparse arrays, cycles, and toJSON are rejected. Explicit null sends null. json conflicts with body/form/files; body conflicts with form/files. Python data mappings are not Node raw bodies: use form explicitly. Byte-chunk arrays remain raw.
- JSON/forms encode in memory, automatically streaming above 512 KiB. Content-Type defaults only when not supplied. Encoded length/framing headers are managed by the SDK.
- files accepts objects, Maps, or repeated pairs. File values are Uint8Array, MultipartReader, or [filename,body,contentType?]; null filename omits it. Default names come from reader.name/field name. Built-in MIME inference covers txt/json/html/csv/png/jpg/jpeg/pdf; otherwise specify a type or get application/octet-stream. Custom part headers are unsupported.
- Multipart permits form fields. read(maxBytes,signal) yields at most 64 KiB, with empty Uint8Array as EOF; sync/Promise readers are accepted without seeks, measuring, temporary files, or full buffering. Callers close/reposition readers. Cancellation-aware I/O is needed for prompt closeAsync cleanup. Adapt Readable/FileHandle rather than passing them directly as multipart readers; raw Readable body destruction follows its existing lifecycle.
- Multipart owns its random boundary/Content-Type, rejects explicit Content-Type and control characters in metadata, and is single-use. 307/308 is not replayed; SDK 301/302/303 rules handle method conversion/body removal.
- request/stream/sse/automatic duplex share encoding. Multipart duplex is unsupported. Manual duplex accepts params and sends through send/finishUpload; automatic JSON/form duplex disables redirects.

## Streaming and cancellation

```js
const controller = new AbortController();
const response = await session.stream('GET', 'https://example.com/large-file', {
  signal: controller.signal,
});
try {
  for await (const chunk of response.body) {
    await consume(chunk);
  }
} finally {
  response.close();
}
```

stream returns after headers. body is a single-use `AsyncIterable<Buffer>`; chunks own independent memory and may be retained, without implying line/event/frame boundaries. The SDK stops reading when the consumer stops pulling. Adapt with Readable.from(body,{objectMode:false}) and pipeline().

StreamResponse.read/text/json asynchronously buffers up to 32 MiB. Consume larger bodies incrementally. Go decodes gzip/deflate/br/zstd by default; decodeContent:false returns raw bytes. Decoded headers omit encoding/length; wireHeaders retains them. maxDecodedBytes defaults to 256 MiB, valid 1..1 TiB, separate from the buffered cap. Unknown encodings, corruption, truncation, and limits raise FastlsDecodeError.

EOF, read failure, and early break close the request. Close responses never iterated explicitly. cancel or AbortSignal remains effective for headers/body. AbortError derives from FastlsError, has code ABORT_ERR, and preserves signal.reason as cause. FastlsTimeoutError exposes connect/write/headers/read/total phase. Session.close cancels owned requests idempotently; cleanup does not rely on GC.

## Pools, cookies, and certificates

Sessions reuse native H1 keep-alive/H2 multiplexing and isolate state. closeIdleConnections retains cookies. **JavaScript SDK code manages cookies and redirects**, not Go:

```js
session.cookies.set('token', 'value', { url: 'https://example.com', path: '/', secure: true });
session.cookies.get('token', 'https://example.com/account');
session.cookies.getAll('https://example.com/account'); // [{ name, value }, ...]
session.cookies.delete('token', { url: 'https://example.com', path: '/' });
session.cookies.clear();
```

Cookie options also include domain, httpOnly, maxAge in seconds, and RFC3339 expires. cookies:false disables automatic receipt/sending; manual Cookie overrides automatic sending. See [cookie scope and limits](../reference/cookies.md).

TLS verification is always enabled. Session caFile replaces system roots without changing system trust; its file is read at construction.

## Proxies

```js
const session = new Session({
  proxy: 'http://user:password@127.0.0.1:8080',
  timeoutMs: { total: 30000, connect: 5000 },
});
try {
  await session.get('https://example.com/');
  await session.get('https://example.com/', { proxy: null }); // Explicit direct access
  await session.get('https://example.com/', { proxy: 'socks5h://127.0.0.1:1080' });
} finally { await session.closeAsync(); }
```

proxy accepts a URL or null. Omission/undefined inherits; null/empty means direct across requests, streams, SSE, and duplex. Other types fail. The current SDK requires transport_context_v1; proxy calls additionally require proxy_tunnels before request registration.

http uses H1 CONNECT for HTTP/HTTPS targets, port 80. socks5 resolves locally; socks5h delegates DNS, port 1080. HTTP Basic and SOCKS credentials are URL-escaped. No environment proxy variables are read. https uses verified proxy TLS then H1 CONNECT, port 443, with https_proxy_tls and no plaintext fallback. SOCKS4/PAC are unsupported.

proxyCaFile trusts the proxy; caFile trusts the target. Defaults read once, request paths reread, undefined inherits, null restores system roots. Direct/HTTP/SOCKS ignore proxy CA input. Address/credentials/profile/proxy roots/target roots isolate pools. Proxy-Authorization/Proxy-Connection target headers are rejected; errors redact credentials. Connect/total and AbortSignal cover establishment; one H2 cancellation preserves other tunnel streams. No downgrade/retry follows rejection. See [proxy reference](../reference/proxy.md).

For proxy tests and resource soak tests, see the [development guide](https://github.com/FastTLS/fastls-ffi/blob/main/node/DEVELOPMENT.md#代理长测).

## HTTP/2 duplex

duplex:true keeps upload open after response headers and always disables redirects. Normal uploads still reject early 2xx before completion.

```js
const response = await session.stream('POST', url, {
  duplex: true,
  body: signal => produceBytes(signal),
});
try {
  for await (const chunk of response.body) await consume(chunk);
  await response.waitUpload();
} finally {
  await response.closeAsync();
}
```

waitUpload checks native EOF acceptance; consume response concurrently to avoid flow-control deadlock. Manual exchanges permit alternating directions:

```js
const exchange = session.duplex('POST', url);
try {
  const reading = exchange.response.then(response => consumeResponse(response.body));
  const writing = (async () => {
    await exchange.send(Buffer.from('first'));
    await exchange.finishUpload();
  })();
  await Promise.all([reading, writing]);
} finally {
  exchange.close();
}
```

send accepts Buffer/Uint8Array, splitting into 64 KiB submissions. One send/finish operation at a time; keep input unchanged until completion. finishUpload closes only upload. Response EOF/cancel/timeout/session close stops production. Early server completion makes manual send fail while the returned response remains readable; waitUpload reports unaccepted EOF. Late producer exceptions abort reading and retain the original error.

close immediately frees native requests. response/session closeAsync also waits for producer cleanup and reports its errors. Use AbortSignal-aware factories or destroyable Readables: arbitrary Promises cannot be forcibly interrupted. Uncooperative I/O can keep cleanup pending despite native release. Duplex buffered reads/request/iteration completion also wait for cleanup. test:duplex:soak defaults to 60 seconds, configurable 1..300, and independently measures native/JS/resource recovery.

## SSE

```js
const events = await session.sse('GET', 'https://example.com/events', {
  timeoutMs: { total: 3_600_000, read: 45_000 },
  lastEventId: '41', // Optional: last committed event ID
});
try {
  for await (const event of events) {
    console.log(event.event, event.id, event.data);
    if (event.data === '[DONE]') break;
  }
} finally { await events.closeAsync(); }
```

session.sse returns a single-consumer SSEStream using normal configuration, cookies, pools, and AbortSignal. Immutable events contain data/event/id/optional millisecond retry; event.json raises SyntaxError for invalid JSON. [DONE] is ordinary data. response exposes metadata and must not be read concurrently.

Parsing handles UTF-8 replacement, initial BOM, arbitrary chunking, CR/LF/CRLF, multiline/empty data, and blank-line dispatch. EOF discards incomplete events. IDs persist/reset and ignore NUL; lastEventId updates only at complete blocks, including id-only blocks. Retry accepts ASCII digits capped to 2147483647. lastEventId initializes the request/parser and rejects NUL/CR/LF. No reconnect/replay is automatic.

Accept:text/event-stream and Cache-Control:no-cache are defaults overridable at request level. HTTP 200 requires one text/event-stream type; 204 is empty, others fail. UTF-8 and native compression integrity rules always apply; compressed SSE cannot disable decodeContent.

maxEventBytes defaults to 1 MiB, valid 1..64 MiB, separately limiting raw lines and UTF-8 data with inserted newlines. There is no background event queue; parser state is additional memory and full streams can exceed 32 MiB. Iteration yields the event loop even when one chunk contains many events.

HTTP total remains 30 seconds unless increased, at most 24 hours, without null/unlimited. Heartbeats reset read, not total. cancel/close/closeAsync/early break clean up; explicitly close streams never iterated. H2 supports duplex/body streaming; upload status is events.response.waitUpload(). The separate 60-second/32-concurrency SSE resource test preserves thresholds and test-only V8 settings. See [SSE](../reference/sse.md).

## WebSocket

```ts
const ws = await session.websocket('wss://example.com/chat', {
  subprotocols: ['chat.v1'], handshakeTimeoutMs: 30000,
  readTimeoutMs: null, writeTimeoutMs: 30000, closeTimeoutMs: 1000,
  maxMessageBytes: 1024 * 1024,
});
try {
  await ws.send('你好');
  const message = await ws.recv(); // string or Buffer; empty messages are valid
} finally { await ws.closeAsync(1000, 'done'); }
```

send/ping/pong wait for native write completion. One reader and one writer may coexist; overlap fails. recv returns a reassembled full message, default 1 MiB, configurable 1..16 MiB, with 125-byte control frames. Node assembly/copies and application-held messages add memory; this is not an unbounded file API.

Normal close throws WebSocketClosed with code/reason retained on the connection. closeAsync's handshake is bounded by closeTimeoutMs, maximum 60000; abort is immediate. Connection AbortSignal affects current/future operations; Session close releases all owned WS. Read/write/handshake timeout terminates the connection with a phase error; HTTP total is not WS lifetime.

Profile, headers, roots, proxies, params, and explicit direct overrides follow Session rules. wss verifies certificates/hostnames and adapts ALPN to H1, without promising exact Upgrade ordering. websocket_v1 is checked in addition to required SDK transport capabilities. Notifications share a local per-session channel; explicit polling is available.

WS and HTTP share the JavaScript jar; native code stores no cookies. cookieMode:manual disables automatic receipt/sending for one handshake. Explicit Cookie wins; cookies:false disables automatic state. Valid 101 and ordinary HTTP rejection/redirect responses can update the jar; invalid 101/TLS failures cannot. Authorization/Origin are caller-supplied. No compression, H2/H3 CONNECT, redirects, heartbeat/reconnect, or replay. Ping completion proves sending only; inspect pongs/last_pong_base64 for replies. See [WebSocket](../reference/websocket.md).

test:quick is local short feedback, test:ws covers 25 WS and 16 shared-cookie cases, and test:ws:soak independently checks 60-second/32-concurrency recovery. None replaces complete 231-case source/install regressions and the native matrix. test:compat separately verifies current cookie send/override/failed-handshake behavior.

## Native readiness notifications

auto selects session_notifications when available, otherwise polling, while still requiring transport_context_v1 and other SDK prerequisites. required rejects missing notification support before context creation; poll explicitly selects the scheduler.

```js
const session = await Session.open({ notifications: 'required' });
try {
  console.log(session.notificationMode); // async-events
  const response = await session.get(url);
} finally { await session.closeAsync(); }
```

Construction is synchronous; first requests initialize the channel, or await ready(signal). Session.open cleans up on initialization failure; ready allows retries. Concurrent initializers share work; cancelling one does not cancel others, and the last leaving closes an unfinished candidate. Initialization has a separate 3-second limit; HTTP total begins at native request creation.

Each session has at most one IPv4 loopback TCP connection authenticated with a 32-byte random token. The temporary 127.0.0.1 listener closes after authentication; at most two candidate connections exist. The channel carries only handshake/wakeup bytes; data still crosses the C ABI. No Go-to-JavaScript callbacks or JavaScript network workers are added.

notificationMode is async-events or poll. Runtime channel failures wake waiters and fail instead of silently falling back. Close releases channels; closeAsync also waits for socket/producer cleanup. Overflow requests a recheck of all active handles. Manual duplex creates its native request only after readiness; closing during initialization sends no HTTP request.

## Scheduling and limits

Go goroutines perform networking. Notifications prompt nonblocking C state checks; generation snapshots prevent missed wakeups and isolate duplex cancellations. Ready work yields the event loop. No fixed throughput/latency is guaranteed; control calls and JSON/Buffer conversions run on the main thread. Poll mode uses a shared roughly 10 ms scheduler with bounded work/time per turn.

Handles use bigint and lossless ABI JSON numbers. Returned C strings are freed individually. Base capabilities include transport_context_v1, stream_decode, phase_timeouts, stream_upload, and write_timeout; feature calls additionally check duplex, proxy, WS, and trailer support. Native loading is pinned for process lifetime (Windows PIN / POSIX NODELETE), preventing unload while Go workers remain. Limits include 64 contexts, 256 open requests, and 16 configurations per context.

## Language differences, installation help, and license

Node uses Promise APIs rather than Python synchronous/multithreaded Session use. Corresponding tests adapt inputs and Promise concurrency without claiming shared-thread safety. Raw Node Readable owns its own file lifecycle; Python caller files remain caller-owned. Factories should honor AbortSignal so return/destroy/finally completes promptly; arbitrary pending user I/O cannot be interrupted by the language.

Library selection: explicit library → FASTLS_LIBRARY → embedded manifest → same-version optional platform package. Source checkouts may fall back to repository dist; installed thin packages cannot. Keep optional dependencies; remove stale external overrides. Platform minima, hashes, and dependencies come from native/manifest.json. See [help](../help/index.md).

[Apache-2.0](https://github.com/FastTLS/fastls-ffi/blob/main/node/LICENSE) applies to owned SDK code; platform packages retain native third-party notices. Use only authorized systems/data and follow applicable laws/terms. The software is provided as-is without promises of availability, anonymity, complete browser equivalence, or third-party acceptance. Browser names imply no endorsement; license rights, warranty exclusions, and applicable law govern. See [full disclaimer](../legal.md).


---

Source: [FastTLS/fastls-ffi · node/README.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/node/README.md). Reviewed 2026-10-27.
