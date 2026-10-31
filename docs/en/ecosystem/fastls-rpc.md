# fastls-rpc


## Service 0.1.2: destination policy and upgrade

The standalone binaries pin core `v0.1.3-0.20261030152832-0dc4eea0f32e`. Start with `-address-policy /trusted/path/policy.json` to load a strict operator-owned policy before accepting traffic. The policy is disabled by default and cannot be replaced through request JSON or headers; restart to change rules. Unsupported backends fail startup. Old binaries must be upgraded explicitly.

Every new connection checks all resolved addresses and dials only approved numeric IPs, preserving the original TLS identity. Unspecified destinations `0.0.0.0`, `::`, and IPv4-mapped zero are rejected as `invalid_ip`, including broad allow rules combined with loopback denies. Empty allow lists do not automatically block private networks. See [policy and configuration](https://github.com/FastTLS/fastls-rpc/blob/main/ADDRESS_POLICY.md).

Fetch, JSON-RPC and gRPC preserve their `address_denied` result envelopes. MITM rejects denied CONNECT targets before success, binds SNI and decrypted requests to that origin, and sends every upstream request through core policy checks. Preflight alone never authorizes an unchecked dial. Keep certificate verification configured: enable MITM `-verify-cert` and configure trusted roots for private CAs. Service H3 selection, UDP proxying and Alt-Svc remain outside this release.

Archives cover Linux/Windows/macOS amd64 and arm64. Main runs service CI; development archives are manual. Releases require successful CI at the exact source commit, plus service integration for RPC, and build each official archive once. Downloaded bytes are checked for hash, signed source, embedded modules, version/help and real policy behavior on all six targets.

JSON-RPC 2.0 and gRPC request services sharing browser/JA3/JA4R resolution and the fastls/ftransport request path. Stable **v0.1.2** binaries are on [GitHub Releases](https://github.com/FastTLS/fastls-rpc/releases), not other package or image registries. Download the matching archive and verify checksums/provenance; Go is unnecessary for binary users.

## Choose an endpoint

- fastls-jsonrpc: default :8801, POST /rpc and GET /health. Suitable for HTTP integrations without generated clients.
- fastls-grpc: default :8802, FastlsService.Health and FastlsService.Fetch. Suitable for Protobuf types and standard gRPC tooling.

The default :8801/:8802 addresses bind all available interfaces, not loopback only. The examples explicitly restrict listening to 127.0.0.1; protect access before exposing them.

## Build and run

Source builds require Go 1.26+ (CI: 1.26.10/1.27.3). Use this repository's go.mod, preferably GOWORK=off. Generated code is committed; protoc/plugins are needed only when editing .proto.

```bash
git clone https://github.com/FastTLS/fastls-rpc.git
cd fastls-rpc
go mod download
go build -o fastls-jsonrpc ./jsonrpc
go build -o fastls-grpc ./grpc
```

Add .exe to output names on Windows.

```bash
./fastls-jsonrpc -addr 127.0.0.1:8801
./fastls-grpc -addr 127.0.0.1:8802

./fastls-jsonrpc -help
./fastls-grpc -version
```

## JSON-RPC example

```bash
curl -X POST http://127.0.0.1:8801/rpc \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc": "2.0",
    "method": "fetch",
    "params": {
      "url": "https://example.com/",
      "method": "GET",
      "browser": "chrome"
    },
    "id": 1
  }'
```

The authoritative gRPC contract is [fastls.proto](https://github.com/FastTLS/fastls-rpc/blob/main/grpc/proto/fastls.proto).

## Fingerprints and transport

Rolling service aliases include chrome/edge/firefox/safari/opera/chromium; versioned selectors permit fixed experiments. Explicit JA3/JA4R overrides browser; absent input uses defaults. Invalid selectors fail explicitly. These aliases differ from Go Provider IDs.

Both adapters use the same executor and field precedence: parent_proxy over proxy, explicit H2 settings over preset values, cancellation propagated downstream. Invalid fingerprints/H2 settings return JSON-RPC -32602 or gRPC INVALID_ARGUMENT. Ctrl+C/SIGINT/SIGTERM stops new work and gives active calls up to five seconds before forced shutdown.

```text
fastls-rpc
  ├─ jsonrpc / grpc
  └─ fastls
      ├─ ftransport       HTTP/1.1 and HTTP/2 (H3 is a separate core path)
      ├─ fastls/profile   Fingerprint model
      └─ imitate          Browser profiles
```

ftransport is the H1/H2 transport; H3 is a separate limited core path. Dependency checks reject local replace directives and fhttp reintroduction.

## Verification and development

```bash
go mod verify
go test ./...
go test -race ./...
go vet ./...
go build ./...
```

CI covers Windows/Linux/macOS, both Go versions, dependency rules, tests/race/coverage/static checks, both binaries, and CLI smoke. Manual development artifacts are temporary. Formal v* tags produce six platform archives containing both services, SHA256, and signed provenance, only on GitHub Releases.

Loopback targets/CONNECT fixtures cover bodies, headers/cookies, request/response trailers, protocol/final URL, compression, redirects, proxy precedence, cancellation, JSON-RPC CORS/body limits, and adapter field mapping, without internet dependencies. Default tests build/start both CLIs over real TCP. Optional workspace_e2e integration builds Fetch/JSON-RPC/gRPC/MITM from neighboring checkouts and records exact revisions; see [workspace integration](https://github.com/FastTLS/fastls-rpc/blob/main/integration/workspace/README.md).

## Documentation

[JSON-RPC overview](https://github.com/FastTLS/fastls-rpc/blob/main/jsonrpc/README.md) · [JSON-RPC API](https://github.com/FastTLS/fastls-rpc/blob/main/jsonrpc/RPC_SERVER.md) · [JSON-RPC examples](https://github.com/FastTLS/fastls-rpc/blob/main/jsonrpc/example/README.md) · [gRPC overview](https://github.com/FastTLS/fastls-rpc/blob/main/grpc/README.md) · [gRPC API](https://github.com/FastTLS/fastls-rpc/blob/main/grpc/GRPC_SERVER.md) · [gRPC examples](https://github.com/FastTLS/fastls-rpc/blob/main/grpc/grpc_example/README.md) · [Development](https://github.com/FastTLS/fastls-rpc/blob/main/DEVELOPMENT.md) · [Artifacts](https://github.com/FastTLS/fastls-rpc/blob/main/ARTIFACTS.md)

## Deployment, limitations, and license

Both services accept caller-controlled targets and proxies. JSON-RPC has a 4 MiB body limit and explicit credential-compatible CORS origins; gRPC retains framework message-size protection. Neither is an unprotected public gateway: add authentication, stricter limits, egress controls, tenant isolation, and auditing.

These services are not full browsers, VPNs, arbitrary protocol forwarders, or guaranteed H3 fingerprint/streaming RPC adapters. Check each installed version's actual options. Report redacted issues at [the repository](https://github.com/FastTLS/fastls-rpc/issues). Owned code uses [Apache-2.0](https://github.com/FastTLS/fastls-rpc/blob/main/LICENSE); retain NOTICE and third-party licenses. See [authorized use/disclaimer](../legal.md).


---

Source: [FastTLS/fastls-rpc · README.md](https://github.com/FastTLS/fastls-rpc/blob/7feeade92f2033ed8bb6cbb45c82e117b49ffdb7/README.md). Reviewed 2026-10-27.

## Upgrading to v0.1.1 (historical)

Uses core v0.1.2 and ftransport/imitate v0.1.1; profile stays at v0.1.0. The services integrate admission and parsing resource boundaries, consistent response contracts, and opt-in redacted auditing. Auditing is disabled by default. Configure its file and shutdown budget explicitly; the bounded queue may drop events, so it is not a complete traffic log. See the [audit configuration](https://github.com/FastTLS/fastls-rpc/blob/v0.1.1/AUDIT.md).

Roll back a verified complete service binary/configuration set. A deployment that requires address policy must not recover by disabling that policy.
