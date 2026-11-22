# imitate profile generator

## Daily maintenance and released data (2026-11-22)

`imitate v0.1.3` includes Windows profiles based on Chrome **158.0.8127.37**, Edge **158.0.4370.33** and Firefox **160.0.1**, at data revision `browser-8ee4c22c6b779cbb`. Select `chrome/158/windows`, `edge/158/windows` or `firefox/160/windows` explicitly. Existing default selectors remain compatible and do not necessarily select these measured versions. The three services accept explicit `chrome158`, `edge158` and `firefox160` names.

The [daily maintenance workflow](https://github.com/FastTLS/imitate/blob/v2/.github/workflows/browser-maintenance.yml) checks official stable versions at **02:17 UTC / 10:17 China time**. Each product collects five fresh cold processes in each of three TLS/H1/H2 scenarios. An independent adoption job checks raw observations, complete Specs and six online/offline replays before a normal fast-forward data commit to the default branch. Collection is read-only; adoption has limited contents-write permission. Failures retain evidence; tags are not moved and branch protections are respected. Adoption can recover from a completed trusted run. Unchanged versions and inputs reuse verified evidence while still exporting a snapshot.

Evidence covers only Windows x64 cold navigation: Chrome en-US headed/minimized, Edge en-US with its window offscreen and software graphics, and Firefox zh-CN headless. Chromium extension membership/parameters do not establish randomized-order distribution equivalence. Resumption, ECH, other systems, H3 and whole-browser behavior remain unverified; ML-DSA remains advertised-only. Capture verifies browser signatures, full versions and applicable official checksums. Chrome's local SHA256 is not a vendor-published checksum.

**Source adoption and consumer upgrades are separate.** Daily maintenance does not publish Go modules, Python/npm packages or service binaries, and import/session/request operations never download updates. Python **0.7.3**, Node **0.16.3**, Fetch **v0.3.2**, RPC **v0.3.3**, MITM **v0.1.4** and fcurl **v0.2.3** pin this module. Older installations need an upgrade or an explicit, digest-reviewed Bundle import/pin/rollback through the existing `ProfileStore`. Raw collection reports and offline snapshots are available in [Actions](https://github.com/FastTLS/imitate/actions/workflows/browser-maintenance.yml); the fixed module source is [v0.1.3](https://github.com/FastTLS/imitate/releases/tag/v0.1.3). A Bundle is a fixed snapshot, not an automatic future-data subscription.

```sh
go get github.com/FastTLS/fastls@v0.2.1
go get github.com/FastTLS/imitate@v0.1.3
go run github.com/FastTLS/imitate/cmd/imitate-export@v0.1.3 -output fingerprints.json
```

The complete Go catalog export is loaded by a Go offline Provider. Python/Node ProfileStore accepts the per-product ProfileBundle v1 candidate from Actions, rather than the complete catalog snapshot.

Python/Node distributions include their native library and fixed data; normal installation does not require Go. Manual capture remains available for [Firefox](https://github.com/FastTLS/imitate/blob/v2/tools/firefox/README.md), [Chrome/Edge](https://github.com/FastTLS/imitate/blob/v2/tools/chromium/README.md), with [maintenance and recovery instructions](https://github.com/FastTLS/imitate/blob/v2/tools/maintenance/README.md).


The independent generator at github.com/FastTLS/imitate produces protocol profiles and identity headers. It does not send HTTP requests. Fastls applies its output through the request library's imitate adapter.

## Install and resolve

```sh
go get github.com/FastTLS/imitate@v0.1.3
```

```go
provider := imitate.New()
result, err := provider.Resolve(context.Background(), profile.ResolveRequest{
    Selector: "chrome/155/windows",
    Policy:   profile.AllowCompatible,
})
```

Generator/Provider values may be shared; use separate request Options. The complete application setup imports the generator and request adapter separately:

```go
import (
    fastls "github.com/FastTLS/fastls"
    "github.com/FastTLS/fastls/imitate"
    generators "github.com/FastTLS/imitate"
)

options := fastls.Options{FingerprintProvider: generators.New()}
match, err := imitate.Use(&options, "chrome/155/windows")
```

## IDs, catalogs, and evidence

Canonical browser IDs use product/version/platform[/variant]. Only the installed finite catalog is supported. Legacy short names, old platform/version orderings, compat-v1, and LegacyUAFirst routing are removed from official generation. Downstream adapters may translate old names. Resolve no longer selects or validates using the user's actual HTTP UA; explicit user header overrides belong to Fastls Options and do not change protocol recipes/order.

UA utility coverage is broader than the fingerprint catalog. Use List for actual profile availability. Browser profiles may use recorded protocol baselines without establishing complete current real-browser equivalence.

The 2026-10-25 source catalog migrated 149 browser profiles and three native baselines to complete Spec for both online resolution and offline export. browser-specs.json is the maintained protocol source; internal/recipes remains historical compatibility tooling, not the official TLS execution path. Canonical historical IDs, including legacy-ja4r, retain their names but now resolve complete Spec. Migration does not itself add browser validation. Unsupported cryptographic claims are explicitly advertised_only rather than negotiation support.

Edge 151–156 Windows profiles were compared with official stable browsers for en-US top-level navigation headers, H1 case, protocol-specific fields, signature lists, GREASE, and extension ordering. Offline bundles preserve per-connection randomization. Evidence is testdata/edge-windows-20261025.json. Other platforms, patch releases, scenarios, and full ECH random distributions remain unverified. Current uTLS cannot verify ML-DSA CertificateVerify; RSA/ECDSA regression coverage is separate. RecordedOnly does not upgrade that limited evidence into complete equivalence.

Protocol-header/signature-capability revisions require matching profile/core versions. A local workspace may bind unpublished modules; remote releases must publish the matching specification/backend first. Do not assume data-only updates implement backend features.

## Native baselines

- library/fastls/2/any/portable-h1
- library/fastls/2/any/portable-h2
- client/fastls-probe/1/any/portable-h1

These are executable project-defined TLS1.2/1.3 baselines, not captured curl/Python/other clients. library profiles generate no UA/Client Hints; client uses fastls-probe/1. Browser entries provide compatible profiles; library/client entries resolve complete Spec directly.

## Offline export

List returns this version's canonical IDs without old aliases/compat-v1. Export returns a closed Bundle with specification/provider/data revisions. Individual exports do not establish that all real-browser random distributions were verified.

```sh
go run ./cmd/imitate-export -output fingerprints.json
go test ./...
```

Fastls imitate.Register(data) creates an isolated read-only Provider, without global registration or download scripts. The data repository stores evidence and fixed outputs; executable recipe maintenance lives here.

Stable module version is v0.1.3. Default-branch data revisions are not automatically new published module releases. Explicit user header values, including empties, override defaults. WithUserAgent changes HTTP UA, not TLS. Unknown profiles fail. See [fingerprint concepts](../concepts/fingerprints.md).

Owned code uses [Apache-2.0](https://github.com/FastTLS/imitate/blob/v2/LICENSE); consult [NOTICE.md](https://github.com/FastTLS/imitate/blob/v2/NOTICE.md) for origins and rights boundaries. Product names belong to their owners and imply no endorsement. Report redacted issues at [the repository](https://github.com/FastTLS/imitate/issues); see [authorized use and disclaimer](../legal.md).


---

Source: [FastTLS/imitate · README.md](https://github.com/FastTLS/imitate/blob/fd10ea4393408e904ae2866ecbfe3efaaaa6ad8e/README.md). Reviewed 2026-10-27.

v0.1.1 updates license and origin materials without refreshing the browser catalog. The profile module remains v0.1.0.
