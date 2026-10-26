# Fingerprints, profiles, and headers

A network fingerprint is an observation of protocol behavior, not a unique identity credential. Identical JA3/JA4R values do not establish identical headers, H2 frames, TLS extension contents, randomization, or browser behavior.

## Three configuration inputs

- JA3 describes selected TLS fields. A JA4 hash cannot reconstruct a complete sendable ClientHello; Fastls supports the parseable **JA4R** description.
- A complete `profile.Spec` explicitly describes supported TLS/HTTP parameters. Backends validate capabilities; renaming an unsupported feature does not implement it.
- An imitate Provider resolves canonical profile IDs and generates identity headers. Browser IDs follow `product/version/platform[/variant]`, such as `chrome/156/windows`. Availability depends on the installed version.

## Component responsibilities

imitate generates profiles; fastls/profile defines the data contract; Fastls validates and sends requests. Python and Node call Fastls through its ABI. fastls-fingerprints holds evidence/data; fastls-lab independently observes behavior. Registration, successful negotiation, and browser equivalence are separate evidence levels.

## Header overrides

Explicit user values override generated defaults, including empty strings. Changing User-Agent does not change the TLS recipe or regenerate all Client Hints. The Go Provider uses canonical IDs. Fetch/RPC/MITM adapters resolve short selectors such as `chrome`; these input formats are not interchangeable.

## Advertising versus implementing algorithms

Advertising an algorithm ID does not mean the backend implements its cryptographic verification. In particular, advertise-only ML-DSA capabilities must not be described as verification support. Measurements for one platform, patch version, or navigation scenario do not validate every browser variant. Pin the tool version, profile ID, data revision, and protocol for precise experiments.

[Go profiles and offline registration](../fastls/profiles.md) · [Complete Spec](../fastls/profile-spec.md) · [imitate](../ecosystem/imitate.md)
