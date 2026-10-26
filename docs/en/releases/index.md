# Versions, installation channels, and upgrades

Checked on 2026-10-27. Pin versions for reproducible installation and review release notes before upgrading; package manager tags may change.

- Go Fastls: `v0.1.1`, module `github.com/FastTLS/fastls`. The imitate generator is `v0.1.0`; profile and ftransport resolve through module dependencies.
- Python: published PyPI package `fastls==0.1.4`, imported as `fastls`. Uninstall the historical `fastls-ffi` distribution before migrating.
- Node: npm currently provides development version `@fastls/fastls@0.10.1-dev.0`. Stable 0.10.1 is validated but has not been uploaded.
- Fetch, RPC, and MITM: independent GitHub Release binaries, separate from language SDK packages.

## Python 0.1.4 / Node 0.10.1

Python 0.1.4 was published on 2026-10-27 with five platform wheels and one SDK-only sdist. All six PyPI SHA256 values match the [GitHub Release](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.1.4). Its [formal CI](https://github.com/FastTLS/fastls-ffi/actions/runs/40366693415) completed with 60 successful jobs and one expected skip. Fresh Windows x64 installation verified HTTPS/2, cookies, WebSocket, module-level methods, and aiohttp-style async entry points.

Node 0.10.1 source and all six packages passed validation. Automatic npm upload encountered a permission error; local recovery requires the account holder's browser authentication. No 0.10.1 package has been published. Its new APIs require the validated candidate, not the older development release.

Python adds aiohttp-style `ClientSession`; Node adds standard `fetch` / `Session.fetch`. Cookies, defaults, and redirects belong to the language SDK; the native library owns transport resources and TLS.

Python's `fastls.request/get/post/put/patch/delete/head/options` issue one-shot synchronous requests. Buffered calls close their temporary session after reading; `stream=True` releases it when the response closes. Use Session / AsyncSession to reuse cookies and connections.

Convenience methods include IDE keyword hints, response/header annotations, and bundled type files for Python 3.10+. Public-suffix cookie validation adds `publicsuffixlist`. See [Python usage](../python/index.md) and the [release notes](https://github.com/FastTLS/fastls-ffi/blob/main/RELEASE_NOTES_0.1.4.md).

## Upgrade procedure

Read the notes, install a pinned version in isolation, and create a Session against a controlled target. Check proxy, CA, cookies, streaming, and cancellation before replacing a deployment. Remove stale `FASTLS_LIBRARY` overrides and mismatched binaries. Roll back the matched package/configuration set rather than replacing one DLL.

Go `v2` identifies a source branch/implementation generation, not a `/v2` import suffix. Default branches, development snapshots, Actions artifacts, GitHub prereleases, and registry releases are distinct states. Use actual published assets, hashes, and provenance to determine availability.

[Fastls releases](https://github.com/FastTLS/fastls/releases) · [SDK releases](https://github.com/FastTLS/fastls-ffi/releases) · [PyPI](https://pypi.org/project/fastls/) · [npm](https://www.npmjs.com/package/@fastls/fastls)
