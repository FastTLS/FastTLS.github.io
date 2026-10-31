# fastls-rpc


## Service 0.1.2: destination policy and upgrade

The standalone binaries pin core `v0.1.3-0.20261030152832-0dc4eea0f32e`. Start with `-address-policy /trusted/path/policy.json` to load a strict operator-owned policy before accepting traffic. The policy is disabled by default and cannot be replaced through request JSON or headers; restart to change rules. Unsupported backends fail startup. Old binaries must be upgraded explicitly.

With policy enabled, every new connection checks all resolved addresses and dials only approved numeric IPs, preserving the original TLS identity. Unspecified destinations `0.0.0.0`, `::`, and IPv4-mapped zero are rejected as `invalid_ip`, including broad allow rules combined with loopback denies. Empty allow lists do not automatically block private networks. See [policy and configuration](https://github.com/FastTLS/fastls-rpc/blob/main/ADDRESS_POLICY.md).

Fetch, JSON-RPC and gRPC preserve their `address_denied` result envelopes. MITM rejects denied CONNECT targets before success, binds SNI and decrypted requests to that origin, and sends every upstream request through core policy checks. Preflight alone never authorizes an unchecked dial. Keep certificate verification configured: enable MITM `-verify-cert` and configure trusted roots for private CAs. Explicit outbound H3 is available in v0.2.0; UDP proxying and Alt-Svc remain unsupported.

Archives cover Linux/Windows/macOS amd64 and arm64. Main runs service CI; development archives are manual. Releases require successful CI at the exact source commit, plus service integration for RPC, and build each official archive once. Downloaded bytes are checked for hash, signed source, embedded modules, version/help and real policy behavior on all six targets.

JSON-RPC 2.0 and gRPC request services sharing browser/JA3/JA4R resolution and the fastls/ftransport request path. Stable **v0.3.0** binaries are on [GitHub Releases](https://github.com/FastTLS/fastls-rpc/releases), not other package or image registries. Download the matching archive and verify checksums/provenance; Go is unnecessary for binary users.

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


Service v0.1.2 includes ingress quotas, response contracts and opt-in bounded audit events; older development notes do not imply these remain unpublished. Tool/documentation maintenance rechecks source evidence while archives keep their actual producer. See [validation and recovery](../releases/index.md).

Maintenance source: [fastls-rpc documentation](https://github.com/FastTLS/fastls-rpc/blob/106107cc21b18dfe135c97e440b998164759a6d7/DEVELOPMENT.md); reviewed 2026-10-31.


## Fetch / RPC 0.2.0: explicit outbound H3

Fetch, JSON-RPC and gRPC add `http_version: "h3"`; omission/empty preserves H1/H2. gRPC uses additive field 16 without changing old fields or methods. H3 requires HTTPS and always verifies the server certificate. Operator-owned `-h3-ca-file` fixes private roots at startup; requests cannot replace trust or address policy.

```json
{"url":"https://api.example.test/","http_version":"h3","method":"GET","timeout":5}
```

Replace the example with an approved H3 target; JSON-RPC puts the object in params. H3 rejects browser/fingerprint (including q), H2 settings, proxy/parent_proxy, Fetch X-Mitm-* controls and request trailers. It applies no default Firefox identity and never falls back to TCP, proxies or Alt-Svc. New connections dial approved numeric UDP peers only. Actual responses report HTTP/3.0 while existing response headers/trailers, bodies, errors, deadlines and quotas remain. Certificate/upstream failures keep ok=false; configuration failures use Fetch 400, JSON-RPC -32602 or gRPC InvalidArgument.

Only Fetch/RPC advance. MITM stays v0.1.2 with no inbound H3/QUIC interception, browser H3 fingerprint, UDP proxy or added platform. The pinned core and Python 0.6.0 / Node 0.15.0 are unchanged. See [Fetch H3](https://github.com/FastTLS/fastls-fetch/blob/v0.2.0/H3.md) and [RPC H3](https://github.com/FastTLS/fastls-rpc/blob/v0.2.0/H3.md).


H3 source: [fastls-rpc H3 contract](https://github.com/FastTLS/fastls-rpc/blob/d14fade742732d2f9f511e8bfe0d1244f15c5b70/H3.md)


## Fetch / RPC 0.3.0: optional cooperative shutdown

Fetch, JSON-RPC and gRPC add operator-owned `-shutdown-cancel-after 1s`. The default `0` disables it and preserves the five-second drain followed by a failing forced fallback. An enabled interval must be greater than zero and less than 5s; invalid values fail before listening. Request JSON, Protobuf and headers cannot override this setting.

A stop event closes admission immediately. Existing upstream work drains first; at the configured interval remaining requests are canceled and the server waits for actual handler/decoder, body, upload and permit release. Drain, cancellation, cleanup and auditing share one absolute five-second deadline measured from stop. `-audit-drain-timeout` may shorten audit waiting but cannot restart the budget. Completed work or cooperative cancellation with successful cleanup exits 0. Uncooperative work, incomplete transport handshakes, audit failure and forced fallback remain nonzero. Disabled mode retains the original separate audit budget.

```sh
fastls-fetch -addr 127.0.0.1:8800 -shutdown-cancel-after 1s -audit-file /private/fetch.jsonl
fastls-jsonrpc -addr 127.0.0.1:8801 -shutdown-cancel-after 1s
fastls-grpc -addr 127.0.0.1:8802 -shutdown-cancel-after 1s
```

Original deadlines and caller cancellation remain; other instances are isolated. Requests still decoding cannot start new upstream work after stop. HTTP body reads are interrupted with a read deadline; non-interruptible decoders retain permits until actual completion. Existing error channels remain: Fetch and JSON-RPC use `ok=false/error_code=cancelled`; an active gRPC call may return `Canceled`. A closed transport may instead surface a connection error, so delivery of a complete response is not guaranteed. Auditing retains cancellation classification without request bodies or sensitive fields.

Unix supports SIGINT/SIGTERM. Windows consoles support Ctrl+C/Ctrl+Break; acceptance uses real Ctrl+Break in a private hidden console. This adds no Windows service-manager integration or remote stop API and gives no graceful guarantee after a process kill. Three entries, H1/H2/H3 and normal/cooperative/forced paths are checked separately. One five-minute mixed-protocol Linux resource observation is followed by shutdown; timings are recorded separately. MITM v0.1.2, the pinned core and Python 0.6.0 / Node 0.15.0 remain unchanged, with no new protocol or platform.
