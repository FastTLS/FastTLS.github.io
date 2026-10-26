# The profile specification module

Module: github.com/FastTLS/fastls/profile. This small independent submodule uses only the Go standard library. It contains no product catalog, UA generator, or protocol backend.

Spec, Metadata, Match, Defaults, and errors retain their import path. TLS IDs are fixed-width 0x0000 JSON strings; TLS extensions, H2 settings, and header/pseudo-header order are ordered arrays. Clone deep-copies. Validate checks model semantics; a request backend separately checks executable support.

Provider.Resolve(context.Context,ResolveRequest) returns exactly one complete Spec or explicit LegacyDefinition. Legacy holds historical JA3/JA4R and neutral H2 parameters; it cannot masquerade as complete Spec. HeaderPolicy describes defaults, overrides, original-value overrides, deletion, and prefix deletion; Values preserves duplicates. Business URLs, proxies, bodies, cookies, authentication, and timeouts are not passed to the Provider.

## Explicit capabilities

Since the 2026-10-25 source revision, official generators emit complete Spec. HeaderConfig adds http1_defaults, http2_defaults, and http1_order. Protocol-specific defaults cannot overlap common defaults. H2 rejects connection-specific headers; header-name casing applies only to H1. shuffle-chrome fixes GREASE/padding positions and shuffles other extensions. Backends must advertise http.headers.protocol.v1, tls.signature-advertised.v1, and tls.shuffle-chrome.v1 for these behaviors.

capabilities.advertised_only distinguishes wire advertisement from implemented cryptography. Unsupported advertisements without this marker still fail; marking an algorithm does not enable verification. LegacyDefinition may supply signature_algorithms absent from JA3, but official catalog maintenance does not use this legacy route.

## Registries and offline data

DecodeCatalog/NewRegistry support strict JSON, a single baseline level, explicit field presence, and immutable queries. NewProvider uses a complete Catalog offline. DecodeBundle accepts a versioned closed snapshot, rejecting unknown fields, duplicate keys/IDs, size violations, and invalid responses. It returns an isolated read-only Provider. Fixed bundles do not recompute Client Hints from another UA.

Former unpublished product lookups (LookupLegacy, LegacyJA4R, LookupBuiltinSelection, LookupCompatibilitySelection) moved into the independent generator's internal/catalog. Applications use imitate.New().Resolve/List/Export. Core historical public presets/frozen catalogs were removed and Use requires a Provider. Product data changes do not require specification changes.

## Versions and precedence

Schema and interface versions are 1. The released submodule tag is profile/v0.1.0; later source fields are not retroactive release guarantees. Use profile/v... tags for submodule releases. Root go test ./... does not include the nested module: run its tests separately. Cross-repository verification uses core scripts/verify-imitate.py.

The 2026-10-23 v2 contract stopped using ResolveRequest.UserAgent to select/validate official profiles. Overrides belong to Options. Registry no longer synthesizes historical platform/version aliases. HeaderPolicy supplies defaults; Fastls applies explicit user headers last. LegacyUAFirst is inactive. Custom catalogs may register aliases explicitly, while official exports omit historical aliases.

Owned code uses [Apache-2.0](https://github.com/FastTLS/fastls/blob/v2/profile/LICENSE), with [NOTICE](https://github.com/FastTLS/fastls/blob/v2/profile/NOTICE). Submodule distributions include the complete license.


---

Source: [FastTLS/fastls · profile/README.md](https://github.com/FastTLS/fastls/blob/fc600f7cc01df1a9ca1784fc15e95eb388f8425c/profile/README.md). Reviewed 2026-10-27; source revision `fc600f7cc01d`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
