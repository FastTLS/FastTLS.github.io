# fastls-fetch


## Service 0.1.2: destination policy and upgrade

The standalone binaries pin core `v0.1.3-0.20261030152832-0dc4eea0f32e`. Start with `-address-policy /trusted/path/policy.json` to load a strict operator-owned policy before accepting traffic. The policy is disabled by default and cannot be replaced through request JSON or headers; restart to change rules. Unsupported backends fail startup. Old binaries must be upgraded explicitly.

With policy enabled, every new connection checks all resolved addresses and dials only approved numeric IPs, preserving the original TLS identity. Unspecified destinations `0.0.0.0`, `::`, and IPv4-mapped zero are rejected as `invalid_ip`, including broad allow rules combined with loopback denies. Empty allow lists do not automatically block private networks. See [policy and configuration](https://github.com/FastTLS/fastls-fetch/blob/main/ADDRESS_POLICY.md).

Fetch, JSON-RPC and gRPC preserve their `address_denied` result envelopes. MITM rejects denied CONNECT targets before success, binds SNI and decrypted requests to that origin, and sends every upstream request through core policy checks. Preflight alone never authorizes an unchecked dial. Keep certificate verification configured: enable MITM `-verify-cert` and configure trusted roots for private CAs. Service H3 selection, UDP proxying and Alt-Svc remain outside this release.

Archives cover Linux/Windows/macOS amd64 and arm64. Main runs service CI; development archives are manual. Releases require successful CI at the exact source commit, plus service integration for RPC, and build each official archive once. Downloaded bytes are checked for hash, signed source, embedded modules, version/help and real policy behavior on all six targets.

An HTTP JSON service that turns a URL, headers, cookies, proxy, and TLS fingerprint options into a server-side request and returns a structured result.

Stable **v0.1.2** binaries are distributed through [GitHub Releases](https://github.com/FastTLS/fastls-fetch/releases), not PyPI/npm/container registries. Download the matching OS/architecture, verify hashes/provenance, and unpack it. Binary users do not need Go.

## Capabilities

POST /fetch issues HTTP/HTTPS requests; GET /health checks the service. Browser selectors, JA3/JA4R, per-request proxies, redirects, timeouts, cookies, User-Agent, trailers, automatic decoding, and CORS are supported. SIGINT/SIGTERM stops new work and allows active requests up to five seconds before forced shutdown. Dependencies use fastls/ftransport, not fhttp.

The default -addr :8800 listens on all available interfaces. The examples explicitly use loopback; configure access controls before exposing the service.

## Run from source

Go 1.26+ is required; CI covers 1.26.10 and 1.27.3. Use the repository go.mod, preferably GOWORK=off.

```bash
git clone https://github.com/FastTLS/fastls-fetch.git
cd fastls-fetch
go mod download
go build -o fastls-fetch .
./fastls-fetch -addr 127.0.0.1:8800
```

On Windows build fastls-fetch.exe and run it with -addr 127.0.0.1:8800. Discover the installed binary's flags/version:

```bash
./fastls-fetch -help
./fastls-fetch -version
./fastls-fetch -addr 127.0.0.1:8800 -debug
```

## First request

```bash
curl http://127.0.0.1:8800/health

curl -X POST http://127.0.0.1:8800/fetch \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com/",
    "method": "GET",
    "browser": "chrome"
  }'
```

Use rolling service selectors chrome/edge/firefox/safari/opera/chromium, or supported versioned selectors such as chrome150..160, edge150..160, and firefox151..158 for fixed experiments. Check the installed version. Explicit JA3/JA4R takes precedence over browser; absent selection uses the service default. These are service adapter names, not Go Provider canonical IDs.

## Behavior and architecture

The request adapter maps explicit options into the core; parent_proxy overrides proxy. Browser presets and custom H2 settings must be valid for the installed service. Consult the [complete API](https://github.com/FastTLS/fastls-fetch/blob/main/fetch_server_example.md) for field names, response shape, defaults, and examples.

```text
fastls-fetch
  └─ fastls
      ├─ ftransport       HTTP/1.1 and HTTP/2 (H3 is a separate core path)
      ├─ fastls/profile   Fingerprint model
      └─ imitate          Browser profiles
```

ftransport provides H1/H2; H3 is a separate restricted core path and does not imply every service option supports H3. CI rejects local replace directives and reintroduction of the fhttp module.

## Development and artifacts

```bash
go mod verify
go test ./...
go test -race ./...
go vet ./...
go build ./...
```

Windows/Linux/macOS and both Go toolchains cover dependency policy, unit/integration/race checks, static validation, CLI smoke, and builds. Manual runs produce temporary development artifacts; v* tags issue six-platform releases, checksums, and signed provenance. See [development](https://github.com/FastTLS/fastls-fetch/blob/main/DEVELOPMENT.md), [examples](https://github.com/FastTLS/fastls-fetch/blob/main/example/README.md), and [artifact verification](https://github.com/FastTLS/fastls-fetch/blob/main/ARTIFACTS.md).

## Deployment boundaries

This is a controlled-network HTTP request service, not a browser, VPN, arbitrary-protocol gateway, or guaranteed streaming RPC transport. Caller-controlled destinations/proxies require deployment authentication, egress restrictions, quotas, tenant isolation, and auditing. CORS is not authentication. Bind to loopback unless deliberately providing a protected service. Example defaults do not provide those controls.

Report redacted reproductions through [issues](https://github.com/FastTLS/fastls-fetch/issues). Owned code uses [Apache-2.0](https://github.com/FastTLS/fastls-fetch/blob/main/LICENSE), with repository NOTICE and third-party materials retained. [Authorized use and disclaimer](../legal.md) applies: no guaranteed availability, anonymity, browser equivalence, or third-party acceptance.


---

Source: [FastTLS/fastls-fetch · README.md](https://github.com/FastTLS/fastls-fetch/blob/c6e3ec88119978e7de32141defef45f32198866a/README.md). Reviewed 2026-10-27.

## Upgrading to v0.1.1 (historical)

Uses core v0.1.2 and ftransport/imitate v0.1.1; profile stays at v0.1.0. The services integrate admission and parsing resource boundaries, consistent response contracts, and opt-in redacted auditing. Auditing is disabled by default. Configure its file and shutdown budget explicitly; the bounded queue may drop events, so it is not a complete traffic log. See the [audit configuration](https://github.com/FastTLS/fastls-fetch/blob/v0.1.1/AUDIT.md).

Roll back a verified complete service binary/configuration set. A deployment that requires address policy must not recover by disabling that policy.


Service v0.1.2 includes ingress quotas, response contracts and opt-in bounded audit events; older development notes do not imply these remain unpublished. Tool/documentation maintenance rechecks source evidence while archives keep their actual producer. See [validation and recovery](../releases/index.md).

Maintenance source: [fastls-fetch documentation](https://github.com/FastTLS/fastls-fetch/blob/08bab98d01a7344129e547545fdc2e6b927bf060/DEVELOPMENT.md); reviewed 2026-10-31.
