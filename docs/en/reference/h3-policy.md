# Explicit H3 with a trusted address policy

Python 0.6.0 / Node 0.15.0 add the native `http3_address_policy_v1` capability.
Supporting H3 and address policies individually does not imply support for their
combination. Both SDKs check the combined capability before creating an owner
or starting a per-request H3 selection on a policy owner. C ABI, transport JSON,
Spec and Bundle formats remain v1.

```python
from fastls import Session

policy = {"allow_schemes": ["https"], "allow_hosts": ["api.example.com"],
          "allow_ports": [443], "deny_cidrs": ["127.0.0.0/8", "::1/128"]}
with Session(http_version="h3", address_policy=policy) as session:
    response = session.get("https://api.example.com/")
    response.raise_for_status()
```

```js
import { Session } from '@fastls/fastls';
const session = new Session({ httpVersion: 'h3', addressPolicy: {
  allow_schemes: ['https'], allow_hosts: ['api.example.com'], allow_ports: [443],
  deny_cidrs: ['127.0.0.0/8', '::1/128'],
} });
try { (await session.get('https://api.example.com/')).raiseForStatus(); }
finally { await session.closeAsync(); }
```

The example host must be replaced with an approved H3 endpoint. Empty allow
lists impose no restriction; this example deny list is not complete SSRF
protection. Rules are copied into an immutable trusted Session owner, never
accepted from ordinary request JSON. Python async sessions and standalone Node
fetch use the same contract. A policy owner may select H3 per request; it cannot
replace its policy. A forced-H3 owner cannot downgrade to auto.

Every new physical QUIC connection resolves afresh, validates every answer and
connects only to numeric IP/port values from that snapshot. Any forbidden answer
rejects the attempt before opening a socket. DNS and all connection attempts
share a 30-second ceiling, subject to shorter request/phase deadlines. Origin,
HTTP authority, SNI and certificate verification retain the original host.
Verification remains enabled by default in both SDKs.

A connected UDP socket fixes the remote peer in the kernel; the PacketConn also
rejects alternate destinations with `peer_change_unsupported`. The policy path
does not expose raw/OOB/batch socket access or enable ECN/GSO, migration,
preferred-address switching, or 0-RTT. An existing approved connection can be
reused; DNS changes do not revoke it retroactively. New connections check a new
snapshot. Each redirect and cached dispatch still checks the logical target.
Handshake failure, cancellation, connection end and owner closure release the
owned sockets. Existing active-body idle-close rules remain in force.

Policy rejections surface as `FastlsError.code == "address_denied"`; missing
combined capability as `unsupported_capability`. Invalid schemas and forbidden
request policy injection are rejected. Proxies, H1/H2 profiles, q fingerprint
selectors, request trailers, WebSockets and H2 duplex remain incompatible with
this H3 policy path. No TCP fallback, automatic Alt-Svc, browser H3 fingerprint,
new platform or service-protocol support is added. Unrestricted H3 is unchanged.

See the [Go policy contract](https://github.com/FastTLS/fastls/blob/main/ADDRESS_POLICY.md)
and the language selector for the Chinese version. Release assets and their source manifests
determine publication and platform validation status.

Unspecified destination addresses (`0.0.0.0`, `::` and mapped zero) are rejected before dialing, even under broad allow rules: Go can interpret them as the local system. This shared policy check also protects H1/H2.

The address safety fix applies to this core source and the new native libraries. Explicitly selecting an older library or running a service binary that has not been rebuilt does not inherit this fix.

## Go source version

For this combination, use the exact Go module pinned by this SDK release:

```sh
go get github.com/FastTLS/fastls@v0.1.3-0.20261030152832-0dc4eea0f32e
```


## Service entry points

Fetch/RPC v0.2.0 separately expose explicit H3. The Python/Node release scope above retains its original version. See [service upgrade](../releases/index.md) for fields, trusted roots and restrictions. MITM adds no inbound H3.


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

RPC v0.3.1 retains request ownership until response sending and statistics finish, avoiding premature cancellation at unary return. Normal auditing, large responses and context lifetime during sending are checked separately. Fetch reuses its original published v0.3.0 archives.


## Go v0.2.0: seven controlled H3 parameters

Go adds `Options.HTTP3 *HTTP3Config`, requiring explicit `HTTPVersion3`. ABI,
Python/Node and Fetch/RPC/MITM keep their existing fields and fixed core pins.

```go
keepAlive := time.Duration(0)
session, err := fastls.NewSession(fastls.Options{
    HTTPVersion: fastls.HTTPVersion3,
    VerifyTLS: true,
    HTTP3: &fastls.HTTP3Config{
        InitialStreamReceiveWindow: 64 << 10,
        MaxStreamReceiveWindow: 1 << 20,
        InitialConnectionReceiveWindow: 128 << 10,
        MaxConnectionReceiveWindow: 2 << 20,
        MaxIdleTimeout: 30 * time.Second,
        KeepAlivePeriod: &keepAlive,
        MaxResponseHeaderBytes: 64 << 10,
    },
})
if err != nil { return err }
defer session.Close()
effective, ok := session.EffectiveHTTP3Config()
_, _ = effective, ok
```

This error-returning function-body fragment imports `time` and
`github.com/FastTLS/fastls`. `Options.EffectiveHTTP3Config()` validates and
inspects local values without network I/O. `HTTP3Capabilities()` returns names,
units, defaults and ranges for all seven supported fields.

- Initial/maximum stream windows default to 512 KiB / 6 MiB; connection windows
  default to 512 KiB / 15 MiB. All four use bytes, zero selects a default, and
  explicit values accept 4 KiB..64 MiB. Each normalized initial value must not
  exceed its maximum. These limit unconsumed receive credit, not cumulative
  transfer size or process memory. MAX_DATA/MAX_STREAM_DATA offsets grow as
  applications consume bytes.
- `MaxIdleTimeout` defaults to 30s, accepting whole milliseconds in 100ms..24h.
  This is a local post-handshake inactivity limit; peer limits and QUIC PTO
  affect actual timing. The fixed backend parses received peer idle parameters
  with a 5s minimum, so its server-side parsed qlog can show 5s while a local
  400ms setting still closes earlier. Inspection is not a negotiation result.
- `KeepAlivePeriod` nil means min(10s, local idle/2), retaining H3's default;
  a pointer to zero disables periodic keepalive. Explicit nonzero intervals
  accept 10ms..local idle/2. A shorter peer idle limit can shorten the actual
  interval. Disabled periodic keepalive does not prohibit recovery/PTO PINGs.
- `MaxResponseHeaderBytes` zero means 10 MiB, with explicit 1 KiB..16 MiB.
  The backend checks each encoded HEADERS frame and the decoded initial field
  section including field overhead. Trailers get the encoded-frame check,
  without an equivalent aggregate decoded trailer cap. This is not a combined
  header/trailer, body, decompression or total-memory cap; bound body reads,
  `MaxDecodedBytes` and request deadlines independently.

Out-of-range/overflow, fractional-millisecond idle values, initial/max conflicts
and unsupported combinations fail before DNS/dial. Nil and empty configuration
preserve explicit-H3 defaults. A non-nil configuration cannot implicitly switch
auto or the legacy q selector to H3. Legacy selection without new fields remains.

Session creation and one-shot preparation copy input, including the keepalive
pointer target. Later caller mutation or editing an inspection result cannot
change that session; do not race writes with preparation. Configuration belongs
to its owner's transport; different owners/configurations/policies never share
QUIC transports. RequestOptions cannot replace it. Create a new session to
change limits. Idle close protects active bodies; cancellation/EOF/Close
releases uploads and sockets without canceling sibling requests or other owners.

CA trust/SNI, trusted AddressPolicy and fixed numeric UDP peers remain. Set
`VerifyTLS: true` explicitly. Existing proxy, H1/H2 Spec, TCP TLS override,
header-order and request-trailer conflicts still reject. Keepalive cannot extend
request total/stage deadlines. Browser H3 fingerprints, arbitrary SETTINGS/QPACK/
order, 0-RTT and UDP proxies remain separate work. See [Go H3 configuration](https://github.com/FastTLS/fastls/blob/v0.2.0/H3_CONFIG.md)
for the full contract, live peer evidence and the one five-minute resource budget.
