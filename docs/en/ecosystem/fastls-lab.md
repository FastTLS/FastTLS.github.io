# fastls-lab

An independent request fingerprint lab. This initial diagnostic implementation does **not** mean every planned capability exists.

Implemented observations include TCP/TLS1.2/1.3; first-request H2 SETTINGS/window/priority/HPACK order on a dedicated port; connection-numbered ClientHello cipher/extension sequences and negotiation; first H1 header order/case/duplicates; WS/WSS H1 Upgrade, uncompressed echo, fragmentation/control/close, and selected negative cases. The collector imports neither Fastls, ftransport, nor uTLS; HPACK decoding uses pinned x/net independently of the Fastls compiler.

Not implemented: general multi-stream H2/H3 serving, complete per-suite matrices, WS compression/subprotocol scenarios, H2/H3 WebSocket, automatic profile comparison, cross-program/device drivers, complete run management, or unified report adaptation. /capabilities reports these limits. Echo/101 success is not browser-equivalence evidence.

## Run

Go 1.26+ is required. Run from the repository, choose a fresh output directory, read lab-manifest.json, configure clients with its endpoints/ca.pem, then inspect management APIs or events.jsonl.

```sh
go test ./...
go run . -output ../reports/lab-run-001
```

HTTP, HTTPS, and administration bind random loopback ports. Startup/manifest includes a dedicated https2 address and CA. Trust only this test CA; no global trust changes or disabled verification are needed. Use a new directory on subsequent runs to avoid overwriting evidence.

Data endpoints are /inspect and /ws; admin endpoints are /health, /capabilities, /events. events.jsonl stores handshake/header/frame metadata, not message contents, Cookie/Authorization values, or raw key_share/PSK key materials. Raw TLS extensions may still contain hostnames: inspect before sharing. Exit retains evidence.

## Limits and evidence

First-header capture: 64 KiB; ClientHello: 128 KiB; WS frame/message: 1 MiB; connection: 15 seconds/256 frames; run: 10000 events/64 MiB. Hitting a cap writes capture.incomplete and fails health checks. Missing/truncated observations cannot be counted as matches. Current capabilities and this guide are self-contained; future expansions need matching tests and redacted evidence.

The H2 receiver processes only each connection's first request, bounded to 256 frames, 64 KiB frame/header block, and 10 seconds. It is not a production H2 server. It records SETTINGS order, WINDOW_UPDATE, PRIORITY, HEADERS priority, and decoded ordered duplicate headers, redacting secrets and omitting raw HPACK blocks. Standard-library H2 calibration and fixed-byte tests independently validate collection/decoding; client-generated output cannot substitute for a reference.

Core scripts/verify-imitate.py drives cross-repository Spec edits, empty/zero H2, and WS/WSS observations. Reports distinguish successful diagnostic execution from agreement with real browser samples.

Owned code uses [Apache-2.0](https://github.com/FastTLS/fastls-lab/blob/main/LICENSE); third-party rights remain intact. Capture rights/privacy are the operator's responsibility. Report redacted issues at [the repository](https://github.com/FastTLS/fastls-lab/issues). See [authorized use/disclaimer](../legal.md).


---

Source: [FastTLS/fastls-lab · README.md](https://github.com/FastTLS/fastls-lab/blob/de2e3d6b83ceb748f7bad241ceb149b196174658/README.md). Reviewed 2026-10-27.
