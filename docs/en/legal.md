# Licenses and disclaimer

## Check licenses by component

FastTLS-owned code in Fastls, fastls/profile, imitate, ftransport, fastls-ffi, fastls-lab, and the Fetch/RPC/MITM services uses Apache-2.0. Consult each repository's LICENSE and notices; third-party code retains its own license. This documentation and its examples use [Apache-2.0](https://github.com/FastTLS/FastTLS.github.io/blob/main/LICENSE).

uTLS retains BSD-3-Clause; quic-go retains MIT. oohttp retains the BSD terms of OONI and the Go Authors and its PATENTS grant. Brand assets, icons, and embedded materials may have separate terms.

The Go-derived portions of fhttp have BSD evidence, but licensing for upstream additions/modifications is unresolved. Do not label the entire library BSD or Apache. The current core has replaced it with ftransport. FastTLS-authored descriptions in the fingerprint data repository use Apache-2.0; future captures and third-party data require separate rights checks.

Binary redistribution must retain applicable licenses, copyright, NOTICE, third-party notices, and patent materials. Hashes verify content integrity and provenance signatures identify origin; neither is a security or legal certification.

## Authorized use and disclaimer

Use only systems, data, and networks you own or are authorized to access, and follow applicable laws, service terms, and privacy requirements. Software is provided as-is under its license, without promises of availability, fitness for a particular purpose, acceptance by third-party services, anonymity, or complete browser equivalence. Browser names and versions describe profiles and imply no vendor certification or endorsement.

Deployers are responsible for access control, keys, personal data, request limits, and backups. Warranty exclusions and liability limits are governed by the accompanying license and applicable law. This notice does not change license rights or impose additional license restrictions.

## Security and data

Do not publish real cookies, access tokens, CA private keys, personal data, or unredacted captures. Restrict request services and proxies with authentication, egress policies, quotas, and auditing. MITM decrypts authorized traffic: protect captures and remove temporary trust configuration afterward. Follow the [organization security policy](https://github.com/FastTLS/.github/blob/main/SECURITY.md) when reporting vulnerabilities.
