# Applying profiles and registering offline bundles

Use resolves canonical IDs into protocol configuration and default headers. The independent generator is github.com/FastTLS/imitate; application stays in the request library's imitate adapter.

```go
var provider = generators.New() // Can be shared concurrently between requests

options := fastls.Options{
    FingerprintProvider: provider,
    Headers: map[string]string{"User-Agent": "my-client/1.0"},
}
match, err := imitate.Use(&options, "chrome/156/windows")
if err != nil { return err }
options.Headers["Sec-Ch-Ua"] = "caller-defined-value"
// Send requests with options; Use itself performs no network I/O.
```

User header values always win, before or after Use, including explicit empties. An arbitrary User-Agent neither selects another fingerprint nor regenerates Client Hints or raises an identity conflict. Changing values does not change TLS, H2, header, or pseudo-header order. Options.UserAgent/WithUserAgent set the actual HTTP UA. New fields follow transport ordering; reserved fields still require valid formats.

## Names and Providers

The official finite catalog accepts canonical IDs such as chrome/156/windows. chrome156-win, old platform/version orderings, compat-v1, and legacy-ua-first are no longer official IDs. Downstream adapters own legacy-name/UA conversion. LegacyUAFirst is inactive. RecordedOnly/AllowCompatible controls acceptance of profiles lacking real-browser evidence; it does not route application requests.

Provider priority is WithProvider, then Options.FingerprintProvider. Supply a generator or offline Register result explicitly. Missing Provider returns ErrInvalidOptions; there is no embedded browser catalog fallback. Missing IDs fail against the chosen source. UseContext supports cancellation and leaves Options unchanged on failure. Invalid headers and unsupported capabilities fail. Providers may be shared concurrently; create separate Options per request.

Apply(&options,spec), Options.Profile, and custom JA3/JA4R do not require the generator. Register(data) returns an isolated offline Provider without global registration. Online/offline sources follow the same explicit-header precedence. Standard List/Export omits old aliases and compat-v1.

## Complete Spec and protocol behavior

Official profiles use complete Spec rather than inferring missing TLS fields from JA3. http1_defaults/http2_defaults apply after ALPN selection; explicit values/empties win. http1_order controls H1 sequence and name case. Profiles with Connection:keep-alive allow persistent H1, but callers must close bodies and idle resources.

Custom JA3/JA4R remains supported. Cold connections do not fabricate PSK identities/binders; only real cached sessions generate PSK extensions. JA3 lacking signature lists retains historical defaults. Override through FingerprintSignatureAlgorithms or StringToSpecWithSignatureAlgorithms, or use complete Spec for richer input. Advertising algorithm codes does not implement cryptography; ML-DSA advertisement and actual negotiation are distinct.

Complete Spec supports TLS1.2/1.3 and implemented extensions with ordered H1/H2 parameters. WS/WSS allows header value overrides but rejects explicit arbitrary Upgrade order and H2/H3 ALPN as UnsupportedFeature. Gorilla is not claimed to reproduce arbitrary browser Upgrade sequences. H3 is outside complete Spec support.

FingerprintUserAgent is a backend parsing identity, separate from the actual request UA. Match product/version/platform describes selection, and Match.UserAgent records the value at Use time. Stable core v0.1.1 and old generator tags may differ from default-branch contracts; check the actual installed versions. See [development](https://github.com/FastTLS/fastls/blob/v2/DEVELOPMENT.md).


---

Source: [FastTLS/fastls · imitate/README.md](https://github.com/FastTLS/fastls/blob/fc600f7cc01df1a9ca1784fc15e95eb388f8425c/imitate/README.md). Reviewed 2026-10-27; source revision `fc600f7cc01d`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
