# Versions, installation channels, and upgrades

Checked on 2026-10-31. Pin versions for reproducible installation and review release notes before upgrading; package manager tags may change.

- Go Fastls: `v0.1.2`, module `github.com/FastTLS/fastls`. The imitate generator is `v0.1.1`; ftransport is v0.1.1 and profile remains v0.1.0.
- Python: published PyPI package `fastls==0.6.0`, imported as `fastls`. Uninstall the historical `fastls-ffi` distribution before migrating.
- Node: stable `@fastls/fastls@0.15.0` on npm. The main and five platform packages use latest=0.15.0; historical development versions remain available.
- Fetch, RPC, and MITM: independent GitHub Release binaries, separate from language SDK packages.

The H3 policy combination uses Go core `v0.1.3-0.20261030152832-0dc4eea0f32e`; earlier stable tags do not imply this capability. See [exact source and restrictions](../reference/h3-policy.md).




## Fetch 0.3.0 / RPC 0.3.1: optional cooperative shutdown

Fetch, JSON-RPC and gRPC add operator-owned `-shutdown-cancel-after 1s`. The default `0` disables it and preserves the five-second drain followed by a failing forced fallback. An enabled interval must be greater than zero and less than 5s; invalid values fail before listening. Request JSON, Protobuf and headers cannot override this setting.

A stop event closes admission immediately. Existing upstream work drains first; at the configured interval remaining requests are canceled and the server waits for actual handler/decoder, body, upload and permit release. Drain, cancellation, cleanup and auditing share one absolute five-second deadline measured from stop. `-audit-drain-timeout` may shorten audit waiting but cannot restart the budget. Completed work or cooperative cancellation with successful cleanup exits 0. Uncooperative work, incomplete transport handshakes, audit failure and forced fallback remain nonzero. Disabled mode retains the original separate audit budget.

```sh
fastls-fetch -addr 127.0.0.1:8800 -shutdown-cancel-after 1s -audit-file /private/fetch.jsonl
fastls-jsonrpc -addr 127.0.0.1:8801 -shutdown-cancel-after 1s
fastls-grpc -addr 127.0.0.1:8802 -shutdown-cancel-after 1s
```

Original deadlines and caller cancellation remain; other instances are isolated. Requests still decoding cannot start new upstream work after stop. HTTP body reads are interrupted with a read deadline; non-interruptible decoders retain permits until actual completion. Existing error channels remain: Fetch and JSON-RPC use `ok=false/error_code=cancelled`; an active gRPC call may return `Canceled`. A closed transport may instead surface a connection error, so delivery of a complete response is not guaranteed. Auditing retains cancellation classification without request bodies or sensitive fields.

Unix supports SIGINT/SIGTERM. Windows consoles support Ctrl+C/Ctrl+Break; acceptance uses real Ctrl+Break in a private hidden console. This adds no Windows service-manager integration or remote stop API and gives no graceful guarantee after a process kill. Three entries, H1/H2/H3 and normal/cooperative/forced paths are checked separately. One five-minute mixed-protocol Linux resource observation is followed by shutdown; timings are recorded separately. MITM v0.1.2, the pinned core and Python 0.6.0 / Node 0.15.0 remain unchanged, with no new protocol or platform.


## Fetch / RPC 0.2.0: explicit outbound H3

Fetch, JSON-RPC and gRPC add `http_version: "h3"`; omission/empty preserves H1/H2. gRPC uses additive field 16 without changing old fields or methods. H3 requires HTTPS and always verifies the server certificate. Operator-owned `-h3-ca-file` fixes private roots at startup; requests cannot replace trust or address policy.

```json
{"url":"https://api.example.test/","http_version":"h3","method":"GET","timeout":5}
```

Replace the example with an approved H3 target; JSON-RPC puts the object in params. H3 rejects browser/fingerprint (including q), H2 settings, proxy/parent_proxy, Fetch X-Mitm-* controls and request trailers. It applies no default Firefox identity and never falls back to TCP, proxies or Alt-Svc. New connections dial approved numeric UDP peers only. Actual responses report HTTP/3.0 while existing response headers/trailers, bodies, errors, deadlines and quotas remain. Certificate/upstream failures keep ok=false; configuration failures use Fetch 400, JSON-RPC -32602 or gRPC InvalidArgument.

Only Fetch/RPC advance. MITM stays v0.1.2 with no inbound H3/QUIC interception, browser H3 fingerprint, UDP proxy or added platform. The pinned core and Python 0.6.0 / Node 0.15.0 are unchanged. See [Fetch H3](https://github.com/FastTLS/fastls-fetch/blob/v0.2.0/H3.md) and [RPC H3](https://github.com/FastTLS/fastls-rpc/blob/v0.2.0/H3.md).

## Validation and publication recovery maintenance (no new version)

Runtime versions remain the releases listed above. For controlled tool/documentation changes, release gates independently verify a trusted main ancestor, native inputs, recipes, platforms/toolchains and every required successful job. RPC contracts have separate input checks. Unknown or production changes restore the relevant tests. Evidence retains its original producer; it does not certify new bytes.

Partial npm recovery first authenticates every exact package version, digest, Sigstore signature and trusted source; the main package stays last. Network/registry propagation retries are bounded. Authentication, content and identity conflicts stop immediately. Recognized transient transparency-log reads can retry failed jobs only, at most three attempts per run, without moving tags or changing versions. Uploads remain GitHub Actions OIDC only. See [publication maintenance and recovery](https://github.com/FastTLS/fastls-ffi/blob/main/node/NPM_RELEASE.md).

Service evidence contains only verification JSON, hashes, identities and logs, separated by run/attempt; official archives remain in Releases. Tool maintenance may consume unchanged bytes on Linux/Windows, while actual new releases still cover their platforms. Unchanged resource mechanisms do not trigger another five-minute, 150-round or hour-long campaign. Failures and historical reports remain available.


## Fetch / RPC / MITM 0.1.2

The three service releases pin core `v0.1.3-0.20261030152832-0dc4eea0f32e` and reject unspecified destinations before dialing when address policy is enabled. Operator-owned startup policy, default behavior and protocol limits are preserved. Old service binaries do not inherit the fix. Six native platform checks include both RPC executables, source attestations and real policy requests. Development archives are manual; exact successful main validation is reused before one official build. See [Fetch](../ecosystem/fastls-fetch.md), [RPC](../ecosystem/fastls-rpc.md) and [MITM](../ecosystem/fastls-mitm.md) for configuration and upgrades.

## Python 0.6.0 / Node 0.15.0

Adds explicit H3 with a trusted Session address policy, numeric-peer UDP binding and the combined `http3_address_policy_v1` capability. No ABI/schema break or dependency upgrade; unrestricted H3 and H1/H2 behavior remain. See [contract](../reference/h3-policy.md) and formal [Python release](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.6.0) / [Node release](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.15.0).

## Python 0.5.0 / Node 0.14.0

Adds complete-Spec H2 first stream ID and initial stream receive-window increments, with native capability negotiation, shared conversion and explicit browser candidates. See [H2 configuration](../reference/browser-profiles.md) and [release](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.5.0).

## Python 0.4.0 / Node 0.13.0

Shared Go-backed compact JA3/H2 conversion, optional ABI v1 capability, verified Firefox 159.0 Windows profile update, manual read-only browser discovery/capture/replay and offline candidates. Existing APIs remain compatible. Known H2 stream details remain explicit; no automatic activation or publishing. [Contract](../reference/browser-profiles.md).


[Python 0.4.0](https://pypi.org/project/fastls/0.4.0/) · [Node 0.13.0](https://www.npmjs.com/package/@fastls/fastls/v/0.13.0) · [Python assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.4.0) · [Node assets](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.13.0)

## Python 0.3.0 / Node 0.12.0

Released on 2026-10-30. Python adds Basic/Bearer authentication, request-local Cookie mappings and atomic session merges. Both SDKs add opt-in retries, explicit body factories and pinned offline ProfileBundle/ProfileStore tools. New business retries are disabled by default; deadlines, cancellation and replay rules bound the entire redirect chain. ABI v1 and existing defaults remain compatible. Native source, module dependencies and unchanged services are tracked separately.

[Python 0.3.0](https://pypi.org/project/fastls/0.3.0/) · [Node 0.12.0](https://www.npmjs.com/package/@fastls/fastls/v/0.12.0) · [SDK assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.3.0) · [Node archives and signatures](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.12.0) · [Contract and examples](../reference/reliability.md)

Certificate/policy failures, cancellation, one-shot uploads and response-body failures are not retried. Non-idempotent methods require explicit authorization. Offline pins verify integrity, not producer authenticity, and imports never fetch configuration. H3 browser fingerprints, UDP proxies, Alt-Svc, online browser capture and additional platforms remain future work. The five existing platforms are retained.

## Python 0.2.0 / Node 0.11.0

Released on 2026-10-29. Trusted Session address policies, complete profile Spec snapshots, and explicit HTTP/3 are now exposed through the C ABI, Python sync/async APIs, and Node Session/fetch. ABI v1 and existing default requests remain compatible; older native libraries reject unsupported new options before sending requests.

[Python 0.2.0](https://pypi.org/project/fastls/0.2.0/) · [Node 0.11.0](https://www.npmjs.com/package/@fastls/fastls/v/0.11.0) · [Original Node archives and signatures](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.11.0) · [Official SDK assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.2.0) · [Capability contract](https://github.com/FastTLS/fastls-ffi/blob/v0.2.0/CAPABILITIES.md)

The SDK pins the public core version v0.1.3-0.20261029044750-32699153caa1.

H3 requires direct HTTPS and never falls back to TCP. It cannot be combined with proxies, address policies, H1/H2 fingerprints, request trailers, WebSocket or H2 duplex. Browser QUIC fingerprints, UDP proxies, automatic Alt-Svc and generic retries remain future work. Unchanged services and components are not republished.

Python retains five platform wheels and an SDK-only sdist; Node retains the main and five platform packages. npm uses GitHub Actions OIDC and PyPI uses trusted publishing. Source identity, hashes, five-platform installation and post-publication registry installation are checked separately. Development packages are not renamed into stable releases, and historical resource observations do not certify new bytes.

## Python 0.1.5 / Node 0.10.2 / services v0.1.1

Published in stages on 2026-10-28–29. The SDK binds the published module graph and records native/package source commits, module checksums, and license digests. Core v0.1.2 and ftransport v0.1.1 integrate connection lifecycle, cancellation, and response-contract fixes. Imitate v0.1.1 updates license materials; profile remains v0.1.0. Fetch, RPC, and MITM v0.1.1 integrate admission/parsing boundaries, consistent responses, and redacted auditing that remains disabled by default.

[Python 0.1.5](https://pypi.org/project/fastls/0.1.5/) · [Node 0.10.2](https://www.npmjs.com/package/@fastls/fastls/v/0.10.2) · [Official SDK assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.1.5)

Python retains five platform wheels and an SDK-only sdist; Node retains its main and five platform packages. The ABI, installation entry points, and default configuration remain unchanged. SDK address policy and complete Spec input remain unimplemented; this release adds no H3 or browser-equivalence claim. Native builds are validated after tagging; development packages are not renamed into stable releases.

## Python 0.1.4 / Node 0.10.1

Python 0.1.4 and Node.js 0.10.1 were released on 2026-10-27. Python provides five platform wheels with the native library and an SDK-only sdist. Node.js provides the main package and five platform packages.

For CI results, package hashes, and upload details, see the [PyPI release record](https://github.com/FastTLS/fastls-ffi/blob/main/PYPI.md) and [npm release record](https://github.com/FastTLS/fastls-ffi/blob/main/node/NPM_RELEASE.md).

Python adds aiohttp-style `ClientSession`; Node adds standard `fetch` / `Session.fetch`. Cookies, defaults, and redirects belong to the language SDK; the native library owns transport resources and TLS.

Python's `fastls.request/get/post/put/patch/delete/head/options` issue one-shot synchronous requests. Buffered calls close their temporary session after reading; `stream=True` releases it when the response closes. Use Session / AsyncSession to reuse cookies and connections.

Convenience methods include IDE keyword hints, response/header annotations, and bundled type files for Python 3.10+. Public-suffix cookie validation adds `publicsuffixlist`. See [Python usage](../python/index.md) and the [release notes](https://github.com/FastTLS/fastls-ffi/blob/main/RELEASE_NOTES_0.1.4.md).

## Upgrade procedure

Read the notes, install a pinned version in isolation, and create a Session against a controlled target. Check proxy, CA, cookies, streaming, and cancellation before replacing a deployment. Remove stale `FASTLS_LIBRARY` overrides and mismatched binaries. Roll back the matched package/configuration set rather than replacing one DLL.

Go `v2` identifies a source branch/implementation generation, not a `/v2` import suffix. Default branches, development snapshots, Actions artifacts, GitHub prereleases, and registry releases are distinct states. Use actual published assets, hashes, and provenance to determine availability.

[Fastls releases](https://github.com/FastTLS/fastls/releases) · [SDK releases](https://github.com/FastTLS/fastls-ffi/releases) · [PyPI](https://pypi.org/project/fastls/) · [npm](https://www.npmjs.com/package/@fastls/fastls)

RPC v0.3.1 retains request ownership until response sending and statistics finish, avoiding premature cancellation at unary return. Normal auditing, large responses and context lifetime during sending are checked separately. Fetch reuses its original published v0.3.0 archives.
