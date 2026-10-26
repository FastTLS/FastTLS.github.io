# Maintaining the documentation

This page is for maintainers. Users should start with [getting started](guide/index.md).

## Sources and synchronization

`sources.json` records the repository, file, and reviewed commit for mirrored guides. `translations.json` pairs every Chinese page with its English counterpart and records the Chinese content hash used for translation. Source mirroring and translation are reviewed changes, not automatic translation services.

When an interface changes, update its repository README, language guide, Chinese mirror, and English page together. Preserve parameter names, code behavior, defaults, platform requirements, unsupported features, and licensing qualifications. Refresh source revisions and translation hashes only after checking both versions. Keep local links within the current language; source-file links may point to GitHub.

READMEs should explain purpose, installation, a complete minimal example, support/limitations, documentation, license, and disclaimer. Build, CI, release, and historical plans belong in maintainer guides. Mark unreleased interfaces explicitly. Unresolved licensing must not be described as confirmed.

## Validation and deployment

Run `npm ci`, `npm run check:links`, and `npm run docs:build`. The checker validates local destinations, language counterparts, and translation freshness. Review both home pages, the language switcher, navigation, mobile layout, search, and code blocks. Pushes to main deploy through GitHub Pages; pull requests only validate. The organization site's base stays `/`, with English at `/en/`. Failed builds do not deploy.

Add user-facing pages to navigation. Use placeholder URLs explicitly, and do not expand protocol support, system compatibility, browser equivalence, or safety claims without evidence.
