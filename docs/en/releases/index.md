# Versions, installation channels, and upgrades

Checked on 2026-10-29. Pin versions for reproducible installation and review release notes before upgrading; package manager tags may change.

- Go Fastls: `v0.1.2`, module `github.com/FastTLS/fastls`. The imitate generator is `v0.1.1`; ftransport is v0.1.1 and profile remains v0.1.0.
- Python: published PyPI package `fastls==0.1.5`, imported as `fastls`. Uninstall the historical `fastls-ffi` distribution before migrating.
- Node: stable `@fastls/fastls@0.10.2` on npm. The main and five platform packages use latest=0.10.2; historical development versions remain available.
- Fetch, RPC, and MITM: independent GitHub Release binaries, separate from language SDK packages.

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
