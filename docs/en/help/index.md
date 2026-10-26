# Installation and runtime troubleshooting

## No matching Python wheel

Use Python 3.10+ with a matching interpreter architecture. Linux requires glibc 2.39+, macOS requires 15+, and Alpine/musl has no bundled wheel. `--only-binary=:all:` exposes unsupported platforms rather than falling back to an sdist without a library. Reproduce in a fresh virtual environment; see [installation](../python/install.md).

## Native loading or missing features

Create a Session: importing alone does not verify installation. Check explicit `library` options, stale `FASTLS_LIBRARY` values, process architecture, and package platform. SDK and library versions must match; an unchanged ABI number does not prove support for newly required features. Do not override a new wheel with an old DLL.

## Missing Node native package

Keep optional dependencies; avoid `--omit=optional`. Run on a supported platform and the main thread. The main and native packages must have identical versions. Historical `@fasttls/fastls` GitHub archives are different from `@fastls/fastls` npm packages. Fix platform, integrity, or capability mismatches rather than bypassing validation. Check [release availability](../releases/index.md) before installing a newly documented version.

## TLS or proxy failures

Check system time, hostnames, and certificate chains. Use `ca_file` / `caFile` for private roots and separate HTTPS proxy CA settings. Explicit roots replace system roots. Enable `VerifyTLS` in direct Go calls. Check proxy scheme, authentication, and DNS behavior; SDKs do not read environment proxies. MITM client trust and upstream verification are separate TLS boundaries.

## Reading, decoding, or timeout errors

Errors can occur after headers arrive. Buffered Session responses have a 32 MiB limit; stream large bodies. Decoded data remains subject to `max_decoded_bytes` / `maxDecodedBytes`. Python uses seconds, Node milliseconds, and Go Session uses context deadlines. Read/write budgets limit stalled progress, not the total duration of a body transfer.

## Resources remain open

Close Sessions, unconsumed responses, SSE streams, and WebSockets. Do not read a response concurrently. Upload producers must cooperate with cancellation; arbitrary Node Promises cannot be forcibly stopped. Diagnostic stats may cover a library instance rather than one session.

## Report a problem

Open an issue in the relevant repository with package version, OS/architecture, minimal code, expected and actual results, redacted errors, and reproduction steps. Do not post credentials, cookies, private keys, or unredacted captures. Follow the organization security policy for sensitive reports.
