# Fastls MITM proxy


## Service 0.1.2: destination policy and upgrade

The standalone binaries pin core `v0.1.3-0.20261030152832-0dc4eea0f32e`. Start with `-address-policy /trusted/path/policy.json` to load a strict operator-owned policy before accepting traffic. The policy is disabled by default and cannot be replaced through request JSON or headers; restart to change rules. Unsupported backends fail startup. Old binaries must be upgraded explicitly.

With policy enabled, every new connection checks all resolved addresses and dials only approved numeric IPs, preserving the original TLS identity. Unspecified destinations `0.0.0.0`, `::`, and IPv4-mapped zero are rejected as `invalid_ip`, including broad allow rules combined with loopback denies. Empty allow lists do not automatically block private networks. See [policy and configuration](https://github.com/FastTLS/fastls-mitm/blob/main/ADDRESS_POLICY.md).

Fetch, JSON-RPC and gRPC preserve their `address_denied` result envelopes. MITM rejects denied CONNECT targets before success, binds SNI and decrypted requests to that origin, and sends every upstream request through core policy checks. Preflight alone never authorizes an unchecked dial. Keep certificate verification configured: enable MITM `-verify-cert` and configure trusted roots for private CAs. Service H3 selection, UDP proxying and Alt-Svc remain outside this release.

Archives cover Linux/Windows/macOS amd64 and arm64. Main runs service CI; development archives are manual. Releases require successful CI at the exact source commit, plus service integration for RPC, and build each official archive once. Downloaded bytes are checked for hash, signed source, embedded modules, version/help and real policy behavior on all six targets.

An HTTP proxy for authorized HTTPS debugging and compatibility testing. It decrypts client traffic and uses selected TLS/HTTP profiles upstream. It can read relayed plaintext and must be managed as sensitive infrastructure.

[Complete guide](https://github.com/FastTLS/fastls-mitm/blob/main/MITM_PROXY.md) · [Delegation](https://github.com/FastTLS/fastls-mitm/blob/main/DELEGATE_EXAMPLE.md) · [Releases](https://github.com/FastTLS/fastls-mitm/releases)

## Install and start

Download the matching release and follow [artifact verification](https://github.com/FastTLS/fastls-mitm/blob/main/ARTIFACTS.md). Go is unnecessary for binary users; source builds require Go 1.26+:

```sh
git clone https://github.com/FastTLS/fastls-mitm.git
cd fastls-mitm
go build -o fastls-mitm .
./fastls-mitm -addr 127.0.0.1:8888 -browser chrome -verify-cert
```

Windows uses fastls-mitm.exe. Check this binary's -help/-version rather than borrowing newer flags. The historical default listen address is :8888; the example explicitly uses loopback. Historical target verification is off, so the example enables -verify-cert.

## First request and CA trust

Startup creates mitm-ca-cert.pem and mitm-ca-key.pem. Give authorized clients only the certificate. Keep the private key on the proxy; never commit or distribute it. Prefer application-scoped trust:

```sh
curl --proxy http://127.0.0.1:8888 --cacert mitm-ca-cert.pem https://example.com/
```

--cacert validates the client-to-proxy certificate; -verify-cert validates proxy-to-target TLS. These are independent connections. Do not substitute disabled verification for correct CA trust.

Python example, after installing requests:

```python
import requests

with requests.Session() as session:
    session.proxies = {"http": "http://127.0.0.1:8888", "https": "http://127.0.0.1:8888"}
    session.verify = "mitm-ca-cert.pem"
    response = session.get("https://example.com/", timeout=30)
    response.raise_for_status()
    print(response.text)
```

## Features and boundaries

HTTP proxying, authorized HTTPS CONNECT MITM, browser selectors, custom JA3/JA4R, startup/request options, H2 settings, parent proxies, and delegation are supported according to the installed version. Profiles affect the upstream side; client-to-proxy TLS remains client-controlled.

This is not a transparent encrypted tunnel, complete browser, arbitrary-protocol VPN, H3/QUIC proxy, or complete multi-tenant service. Certificate pinning, custom trust, or mutual TLS can prevent interception. No anti-bot acceptance or browser equivalence is guaranteed. Protect listeners, logs, CA keys, and captures; permit request-controlled settings only to trusted callers. Historical detailed examples must be compared with the installed CLI's defaults. Windows curl revocation behavior depends on its TLS backend and environment.

[Proxy parameters](https://github.com/FastTLS/fastls-mitm/blob/main/MITM_PROXY.md) · [Delegation](https://github.com/FastTLS/fastls-mitm/blob/main/DELEGATE_EXAMPLE.md) · [Client examples](https://github.com/FastTLS/fastls-mitm/blob/main/example/README.md) · [Development](https://github.com/FastTLS/fastls-mitm/blob/main/DEVELOPMENT.md)

Report redacted reproductions via [issues](https://github.com/FastTLS/fastls-mitm/issues). Owned code is [Apache-2.0](https://github.com/FastTLS/fastls-mitm/blob/main/LICENSE), with NOTICE and third-party terms preserved. See [authorized use, data handling, and disclaimer](../legal.md).


---

Source: [FastTLS/fastls-mitm · README.md](https://github.com/FastTLS/fastls-mitm/blob/4074759048bd4375cf5d047538d892ff9d3154b9/README.md). Reviewed 2026-10-27.

## Upgrading to v0.1.1 (historical)

Uses core v0.1.2 and ftransport/imitate v0.1.1; profile stays at v0.1.0. MITM integrates default proxy response contracts, cancellation and connection reuse handling, and opt-in redacted auditing. Auditing is disabled by default. Configure its file and shutdown budget explicitly; the bounded queue may drop events, so it is not a complete traffic log. See the [audit configuration](https://github.com/FastTLS/fastls-mitm/blob/v0.1.1/AUDIT.md).

Roll back a verified complete service binary/configuration set. A deployment that requires address policy must not recover by disabling that policy.
