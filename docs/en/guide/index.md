# Choose a client

FastTLS configures TLS handshakes, HTTP protocol parameters, and request header order. It is useful for protocol research, compatibility testing, and applications that need control over network behavior. Choose a browser profile or use custom JA3/JA4R descriptions and complete Spec configurations in Go.

## Choose by language

- **Go:** use [Fastls](../fastls/index.md). Browser profiles require an explicitly configured generator or offline Provider.
- **Python:** use the [Python SDK](../python/index.md) for synchronous requests or asyncio, cookies, and streaming responses.
- **Node.js:** use the [Node.js SDK](../node/index.md) for Promise APIs, TypeScript, ESM, and CommonJS.

Python wheels and Node platform packages bundle the native library. Regular installation does not require Go, a C compiler, or an RPC service. Check each language's timeout units, certificate verification defaults, and resource ownership rules.

Use the [companion tools](../ecosystem/index.md) if you need an HTTP/gRPC service, a debugging proxy, or independent protocol observations.

## Suggested reading

Install the client and make a first request. Then learn sessions, timeouts, and response handling. The [examples directory](../examples/index.md) links to proxies, file transfers, SSE, and WebSocket. Read [fingerprint concepts](../concepts/fingerprints.md) to understand what profiles can establish, or [troubleshooting](../help/index.md) if installation or requests fail.

## Before making requests

Check the operating system and architecture, then actually create a Session to verify native loading. Use only targets you own or are authorized to access. Upload, SSE, WebSocket, and duplex example URLs must be replaced with services implementing those protocols.

FastTLS does not start a browser or execute page JavaScript. A profile describes implemented network parameters; it does not establish complete browser equivalence or guarantee acceptance by third-party services.

[Support](../concepts/support.md) · [Versions](../releases/index.md) · [Licenses and disclaimer](../legal.md)
