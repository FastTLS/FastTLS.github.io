# Sessions, requests, and responses

A Session fixes transport identity, supports concurrent requests, and reuses connections. Configure profile, proxy, target CA, and CookieJar before creation; create another Session to change identity. See the [complete example](index.md).

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
response, err := session.DoContext(ctx, "https://example.com/api", fastls.RequestOptions{
    Headers: map[string]string{"Content-Type": "application/json"},
    Body: `{"message":"hello"}`,
    DisableRedirect: true,
}, "POST")
```

This snippet assumes an existing session and imports context, time, and fastls. Body is text; streaming uses an io.ReadCloser BodyReader, mutually exclusive with Body. RequestOptions.Trailers is net/http.Header. Explicit header values override defaults. Use HeaderValues for duplicates rather than flattened Headers alone.

## Responses and errors

Response.Status is the numeric status; Protocol is the actual protocol; FinalURL is the destination after redirects. Handle call errors first and close a returned Body even when an error accompanies it. On success, read and close Body, checking read errors. HTTP 4xx/5xx is application policy, not automatically a call error. Trailer becomes complete after EOF.

## Deadlines and close

DoContext's context bounds the Session request total; Options.Timeout does not bound reused sessions. RequestOptions.Timeouts uses time.Duration for Connect, Headers, Read, and Write. Without a total deadline, waits may be long-lived. Close cancels owned requests and rejects new work; CloseIdleConnections only releases idle connections. Do not cancel the context before body consumption finishes.

## Decoding and streaming

Body is already a stream. DecodeContent enables gzip/deflate/br/zstd; MaxDecodedBytes bounds decoded output and WireHeaderValues preserves original headers. An upload producer's Close must unblock Read to permit cancellation cleanup. Explicit Duplex requires an H2 target capable of simultaneous directions.

The [Session source](https://github.com/FastTLS/fastls/blob/0dc4eea0f32ebc86b538f17cac383e80cd5c03eb/session.go) and [Options/Response](https://github.com/FastTLS/fastls/blob/0dc4eea0f32ebc86b538f17cac383e80cd5c03eb/index.go) define the complete Go API. Compare default-branch additions with the installed tag. Python/Node parameter names and defaults do not transfer directly to Go.


## H3 and a trusted address policy

Set `fastls.Options{HTTPVersion: fastls.HTTPVersion3, AddressPolicy: policy, VerifyTLS: true}` for explicit H3 with the immutable policy. Every new QUIC connection validates all DNS answers and pins a connected UDP socket to an approved numeric peer, retaining the original SNI and certificate name. No q selector, proxy, migration, ECN/GSO or 0-RTT is enabled on this path. See [contract and SDK examples](../reference/h3-policy.md).
