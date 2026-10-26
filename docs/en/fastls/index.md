# Fastls for Go

Control TLS handshakes, HTTP parameters, and request header order. Choose browser profiles, custom JA3/JA4R descriptions, or complete profile.Spec input. Sessions reuse connections and consume responses as streams.

For other languages, start with [Python](../python/index.md) or [Node](../node/index.md).

## Install

Go 1.26+ is required. Run in your own Go project:

```sh
go get github.com/FastTLS/fastls@v0.1.1
go get github.com/FastTLS/imitate@v0.1.0
```

The stable core is v0.1.1. v2 is a source branch/implementation generation; the module path has no /v2 suffix. Pin a release rather than treating default-branch additions as released features.

## First request

```go
package main

import (
    "context"
    "fmt"
    "io"
    "log"
    "time"

    fastls "github.com/FastTLS/fastls"
    "github.com/FastTLS/fastls/imitate"
    generators "github.com/FastTLS/imitate"
)

func main() {
    options := fastls.Options{
        FingerprintProvider: generators.New(),
        VerifyTLS: true,
    }
    if _, err := imitate.Use(&options, "chrome/156/windows"); err != nil {
        log.Fatal(err)
    }
    if err := fetch(options); err != nil {
        log.Fatal(err)
    }
}

func fetch(options fastls.Options) error {
    session, err := fastls.NewSession(options)
    if err != nil { return err }
    defer session.Close()
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    response, err := session.DoContext(ctx, "https://example.com/", fastls.RequestOptions{}, "GET")
    if err != nil {
        if response.Body != nil { response.Body.Close() }
        return err
    }
    defer response.Body.Close()
    fmt.Println(response.Status, response.Protocol, response.FinalURL)
    _, err = io.Copy(io.Discard, response.Body)
    return err
}
```

Use requires an explicit generator or offline Provider. Available IDs come from that provider's List; unknown names fail. Custom JA3/JA4R and complete Spec input do not require the generator.

## Supported features

- H1/H2, ordered headers, cookies, HTTP/HTTPS CONNECT, and SOCKS5 proxies.
- JA3, JA4R, and complete Spec input, with explicit header values overriding profile defaults.
- Concurrent reusable Sessions, cancellation, phase timeouts, streaming uploads/downloads, request/response trailers, decoding, and H2 duplex.
- WS/WSS over H1 Upgrade and a restricted HTTP/3 path.

## Defaults and limitations

- Fingerprinted Go TCP TLS historically disables verification at its zero value. Explicitly set VerifyTLS:true; language SDK defaults differ.
- Options.Timeout applies to one-shot use. Reusable Session total deadlines come from each DoContext context; RequestOptions.Timeouts configures phase budgets.
- Close response bodies and Sessions, including bodies returned alongside errors. Reads can fail after headers. Applications decide how to handle HTTP error statuses; trailers are complete at EOF.
- Complete Spec support covers H1/H2. H3 does not reproduce arbitrary ClientHello order and rejects proxies rather than silently going direct.
- WS does not support compression, arbitrary Upgrade header order, redirects, or H2/H3 Extended CONNECT.
- No browser runtime, page JavaScript, CAPTCHA handling, anonymity, or universal acceptance is provided.
- Default-branch address policies and lifecycle fixes require checking the actual installed release tag.

## More documentation

[Sessions](session.md) · [Profiles/offline registration](profiles.md) · [Spec module](profile-spec.md) · [Services](https://github.com/FastTLS/fastls/blob/v2/services/README.md) · [Test tools](https://github.com/FastTLS/fastls/blob/v2/tools/README.md) · [Development](https://github.com/FastTLS/fastls/blob/v2/DEVELOPMENT.md) · [Release policy](https://github.com/FastTLS/fastls/blob/v2/RELEASE.md)

For issues, provide version, OS/architecture, redacted minimal code, and errors at [the repository](https://github.com/FastTLS/fastls/issues). Do not include credentials, cookies, keys, or personal data.

## License and disclaimer

Owned code uses [Apache-2.0](https://github.com/FastTLS/fastls/blob/v2/LICENSE); retain [NOTICE](https://github.com/FastTLS/fastls/blob/v2/NOTICE) and [third-party notices](https://github.com/FastTLS/fastls/blob/v2/THIRD_PARTY_NOTICES.md).

Use authorized systems and data under applicable laws/terms. The software is as-is without guarantees of availability, suitability, anonymity, browser equivalence, or third-party acceptance. Browser names imply no endorsement. Deployers manage access, secrets, personal data, limits, and backups. License terms and applicable law govern warranty/liability; this notice adds no license restriction. See [the full disclaimer](../legal.md).
