# Support and limitations

## Go core

HTTP/1.1, HTTP/2, JA3/JA4R, complete Spec configurations, connection pooling, streaming, and proxies are supported. For fingerprinted TCP TLS requests, explicitly enable `VerifyTLS: true`: the historical zero value disables verification. Session total deadlines come from the request context.

HTTP/3 is a restricted path. It supports neither proxies nor arbitrary browser ClientHello reproduction. WS/WSS uses HTTP/1.1 Upgrade, without compression or H2/H3 Extended CONNECT.

## Python

Python 3.10+, synchronous and asyncio APIs. The default HTTP total timeout is 30 seconds; HTTP and WebSocket timeout parameters use **seconds**. Certificates are verified by default; there is no `verify=False`. Bundled wheels cover Windows x64, Linux glibc 2.39+ x64/ARM64, and macOS 15+ x64/ARM64. Alpine/musl has no bundled wheel.

## Node.js

Node 22+ on the main thread, with Promise APIs, TypeScript, ESM, and CommonJS. Timeouts use **milliseconds**. Stable 0.12.0 supports five native platforms; exact minimum systems are recorded in `native/manifest.json`. worker_threads, Electron, Bun, browsers, and musl are unsupported. TLS certificates are verified by default.

## SDK responsibilities

Python 0.3.0 and Node 0.12.0 are published stable releases. These versions keep cookies, defaults, and redirects in their language SDKs. The native library manages connections, fingerprints, certificates, and transport I/O. Python offers requests-style synchronous calls and aiohttp-style ClientSession; Node offers a standard fetch response adapter. These APIs ease common migrations without claiming complete compatibility with the reference libraries.

## Protocol and resource limits

Python 0.3.0 / Node 0.12.0 support H1/H2, complete custom Specs and explicit direct HTTPS/H3. Address policies belong to trusted Session construction; see the capability contract for incompatible H3 options. Buffered Session responses are limited to 32 MiB. Node fetch follows standard Response memory behavior: consume `body` as a stream for large responses. Automatic decoding defaults to a 256 MiB output limit. A streaming response has one reader. SSE and WebSocket do not reconnect automatically. WebSocket compression and H2/H3 Extended CONNECT are unsupported. Check HTTP error statuses explicitly with `raise_for_status()` / `raiseForStatus()` or fetch `response.ok`.

## No client guarantees

No browser DOM/JavaScript runtime, CAPTCHA handling, anonymity, universal site access, or complete browser equivalence is provided. Unknown profiles and unsupported combinations should fail explicitly; a fallback or a successful request is not fingerprint verification.

## Authentication, retries and offline profiles

Python supports Basic/Bearer auth and request-local Cookie mappings. Both SDKs offer opt-in RetryPolicy and explicit body factories under one deadline. Policy/certificate failures, cancellation, one-shot bodies and response-body read failures are not retried. ProfileBundle/ProfileStore validate caller-pinned Spec bytes and native backend support offline; failed imports preserve the active pin. Checksums do not authenticate producers. See [contract and examples](../reference/reliability.md).
