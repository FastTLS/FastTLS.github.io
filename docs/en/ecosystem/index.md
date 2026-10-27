# Companion tools and projects

For application requests, start with a Go, Python, or Node client. Choose a separate tool when deploying a request service, inspecting proxy traffic, or observing protocol behavior.

- [Fetch](fastls-fetch.md): an HTTP JSON service exposing `POST /fetch`.
- [RPC](fastls-rpc.md): JSON-RPC and gRPC services for standard client tooling.
- [MITM](fastls-mitm.md): an authorized HTTPS debugging proxy that can read relayed plaintext. Protect its CA key and access boundary.
- [imitate](imitate.md): a profile generator; it does not send HTTP requests.
- [ftransport](ftransport.md): configurable H1/H2 transport using standard `net/http` types.
- [fastls-lab](fastls-lab.md): limited independent TLS/H1/H2/WS/WSS observations, not a complete protocol certification platform.

## Historical and data repositories

[fastls-fingerprints](https://github.com/FastTLS/fastls-fingerprints) has not published a dataset. [fhttp](https://github.com/FastTLS/fhttp) and [oohttp](https://github.com/FastTLS/oohttp) are historical forks; the current core uses ftransport. Licensing for upstream fhttp additions and modifications remains unresolved, so the entire library must not be described as BSD- or Apache-licensed.

[uTLS](https://github.com/FastTLS/utls) and [quic-go](https://github.com/FastTLS/quic-go) are upstream forks and may retain upstream Go module paths. Use them directly only when you understand branch differences and compatibility requirements. SDK users do not need to install them separately.
