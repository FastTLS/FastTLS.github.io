# ftransport

A Go H1/H2 client transport using standard net/http types, with ordered request headers and H2 connection parameters. Use [Fastls](../fastls/index.md) for browser identities and TLS ClientHello profiles.

## Install and first request

Go 1.26+:

```sh
go get github.com/FastTLS/ftransport@v0.1.0
```

```go
package main

import (
    "io"
    "log"
    "net/http"
    "time"
    "github.com/FastTLS/ftransport"
)

func main() {
    if err := run(); err != nil { log.Fatal(err) }
}

func run() error {
    transport, err := ftransport.NewTransport(ftransport.Config{})
    if err != nil { return err }
    defer transport.Close()
    client := &http.Client{Transport: transport, Timeout: 30*time.Second}
    response, err := client.Get("https://example.com/")
    if err != nil { return err }
    defer response.Body.Close()
    _, err = io.Copy(io.Discard, response.Body)
    return err
}
```

## Support and limitations

- Concurrent RoundTripper, H1/H2 reuse, streaming, cancellation, and close.
- Ordered H1 headers; explicit empty/zero H2 SETTINGS, connection window, PRIORITY, HEADERS priority, pseudo/ordinary header order, and HPACK never-indexed.
- Standard TLS verification by default, without automatic environment proxies or response decompression.
- Custom dialers/protocol discovery or explicit single-protocol selection. A custom dialer owns proxy/TLS/certificate/hostname correctness; on successful return the transport owns the connection.
- No browser profile generation, JavaScript execution, or H3. Standard net/http type compatibility is not identical internal behavior.
- H2 origin limits, queue timeouts, and idle close are available. Black-box multi-connection accounting/retry combinations that are unsupported are rejected explicitly.

## Design and maintenance

[Design](https://github.com/FastTLS/ftransport/blob/main/DESIGN.md) · [Protocol probes](https://github.com/FastTLS/ftransport/blob/main/PROBES.md) · [Migration](https://github.com/FastTLS/ftransport/blob/main/MIGRATION.md) · [Source/license mapping](https://github.com/FastTLS/ftransport/blob/main/SOURCES.md). The [implementation plan](https://github.com/FastTLS/ftransport/blob/main/IMPLEMENTATION_PLAN.md) is historical, not a release guarantee.

Report version, OS/architecture, and redacted reproductions through [issues](https://github.com/FastTLS/ftransport/issues). Owned code uses [Apache-2.0](https://github.com/FastTLS/ftransport/blob/main/LICENSE) and NOTICE. Go/x/net-derived files retain BSD and patent materials documented in SOURCES.md. [Disclaimer](../legal.md): authorized use only, software as-is, no anonymity/browser-equivalence/third-party acceptance guarantee.


---

Source: [FastTLS/ftransport · README.md](https://github.com/FastTLS/ftransport/blob/80bacf356d8f0b7ed17d398e7f43a15b89e674fc/README.md). Reviewed 2026-10-27; source revision `80bacf356d8f`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
