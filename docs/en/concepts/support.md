# Support and limitations

## Go core

HTTP/1.1, HTTP/2, JA3/JA4R, complete Spec configurations, connection pooling, streaming, and proxies are supported. For fingerprinted TCP TLS requests, explicitly enable `VerifyTLS: true`: the historical zero value disables verification. Session total deadlines come from the request context.

HTTP/3 is a restricted path. It supports neither proxies nor arbitrary browser ClientHello reproduction. WS/WSS uses HTTP/1.1 Upgrade, without compression or H2/H3 Extended CONNECT.

## Python

Python 3.10+, synchronous and asyncio APIs. The default HTTP total timeout is 30 seconds; HTTP and WebSocket timeout parameters use **seconds**. Certificates are verified by default; there is no `verify=False`. Bundled wheels cover Windows x64, Linux glibc 2.39+ x64/ARM64, and macOS 15+ x64/ARM64. Alpine/musl has no bundled wheel.

## Node.js

Node 22+ on the main thread, with Promise APIs, TypeScript, ESM, and CommonJS. Timeouts use **milliseconds**. The validated 0.10.1 package set and published 0.10.1-dev.0 support five native platforms; exact minimum systems are recorded in `native/manifest.json`. worker_threads, Electron, Bun, browsers, and musl are unsupported. TLS certificates are verified by default.

## SDK responsibilities

Python 0.1.4 is published; Node 0.10.1 is validated but awaits upload. These versions keep cookies, defaults, and redirects in their language SDKs. The native library manages connections, fingerprints, certificates, and transport I/O. Python offers requests-style synchronous calls and aiohttp-style ClientSession; Node offers a standard fetch response adapter. These APIs ease common migrations without claiming complete compatibility with the reference libraries.

## Protocol and resource limits

The SDKs expose H1/H2, not arbitrary complete Spec input. Buffered Session responses are limited to 32 MiB. Node fetch follows standard Response memory behavior: consume `body` as a stream for large responses. Automatic decoding defaults to a 256 MiB output limit. A streaming response has one reader. SSE and WebSocket do not reconnect automatically. WebSocket compression and H2/H3 Extended CONNECT are unsupported. Check HTTP error statuses explicitly with `raise_for_status()` / `raiseForStatus()` or fetch `response.ok`.

## No client guarantees

No browser DOM/JavaScript runtime, CAPTCHA handling, anonymity, universal site access, or complete browser equivalence is provided. Unknown profiles and unsupported combinations should fail explicitly; a fallback or a successful request is not fingerprint verification.
