# fastls Python SDK

Send browser-profiled HTTP requests through the native Fastls library, with synchronous/asyncio APIs, streaming transfers, H2 duplex, SSE, and WebSocket. The distribution and import name are both fastls; the repository is fastls-ffi. This guide covers published **0.1.4**.

## Installation and platforms

Python 3.10+ is required. Prefer a virtual environment:

```shell
python -m pip install --only-binary=:all: fastls==0.1.4
```

Platform wheels contain the native library: no Go, C compiler, or separate DLL download is needed. --only-binary=:all: rejects unsupported platforms rather than installing an SDK-only sdist.

- Windows x86-64 Python: win_amd64.
- Linux x86-64/ARM64: manylinux_2_39_x86_64 / manylinux_2_39_aarch64, glibc 2.39+. Alpine/musl is unsupported.
- macOS Intel/Apple Silicon: macosx_15_0_x86_64 / macosx_15_0_arm64, macOS 15+.

Choose the wheel for the running interpreter, not the simulated browser: Linux can use chrome/156/windows. Historical v0.1.2 GitHub assets retain fastls_ffi and linux_* names; do not rename them. Uninstall fastls-ffi before installing fastls, since both own the same import directory.

```shell
python -c "from importlib.metadata import version; print(version('fastls'))"
```

See [installation](install.md) for GitHub URLs, upgrades, removal, and troubleshooting.

## Direct requests

Module-level helpers are new in 0.1.4; upgrade older versions or use Session.

```python
import fastls

resp = fastls.request("GET", "https://tls.peet.ws/api/all")
resp.raise_for_status()
print(resp.json())

# GET shorthand:
resp = fastls.get("https://tls.peet.ws/api/all", timeout=15)
print(resp.status_code, resp.text)
```

request/get/post/put/patch/delete/head/options accept Session.request options such as params, headers, json, data, files, profile, proxy, and timeout. library, ca_file, cookies, and notifications configure a temporary session; cookies is a boolean automatic-management switch, not a cookie dictionary.

Keyword annotations provide IDE hints and a Response return type with status_code:int, text:str, content:bytes, and typed headers. JSON remains Any because its schema is target-dependent. Type files support Python 3.10+ without a runtime typing_extensions dependency; publicsuffixlist is installed for cookie validation.

Buffered one-shot calls create a temporary session, read the response, and close its native request/context. Returned content/text/json/headers remain usable. HTTP 4xx/5xx returns a response until raise_for_status() is called. head() does not follow redirects by default, matching requests; override with allow_redirects=True.

Separate calls do not share cookies or connections. Reuse Session for login/state or sustained traffic; async entry points are ClientSession or AsyncSession. Buffered responses have a 32 MiB cap. stream=True returns an unbuffered response that must be closed with with/close(). Session.stream() is also retained.

## Migrating from requests / aiohttp

Common synchronous code can use import fastls as requests: get, Session, params/json/data/files, status_code/text/content/json(), and raise_for_status() retain familiar shapes. Streaming also supports:

```python
import fastls

with fastls.get("https://example.com/data", stream=True, profile="chrome/156/windows") as response:
    response.raise_for_status()
    for chunk in response.iter_content(65536):
        print(len(chunk))
```

For aiohttp-style code, use ClientSession:

```python
import asyncio
import fastls

async def main():
    async with fastls.ClientSession(profile="chrome/156/windows", timeout=30) as session:
        async with session.get("https://tls.peet.ws/api/all") as response:
            response.raise_for_status()
            print(response.status, await response.json())

asyncio.run(main())
```

Read with await response.read()/text()/json() or response.content.iter_chunked(n). Explicit cleanup is response.release() or await response.wait_for_close(); ClientSession.close() is async. Existing AsyncSession retains buffered responses, aread/aiter_bytes, duplex, SSE, and WebSocket.

Compatibility targets common workflows, not all features. Requests auth/hooks/adapters/verify=False, environment proxies, aiohttp connectors/TraceConfig, and the full StreamReader API are unsupported. Use seconds/Timeout, ca_file, and proxy. Cookies are URL-scoped, not a full RequestsCookieJar: cookies={...} is unsupported; use session.cookies.set(...,url=...) or a manual Cookie header. Unsupported keywords fail explicitly.

## Session ownership and redirects

Python owns defaults, cookies, redirect policy, and response history. Native contexts own pools, TLS/fingerprints, certificates, and I/O. Node uses its own independent JavaScript jar. Closing a session clears cookies and releases owned resources; nothing is persisted to disk.

The default redirect cap is 30; adjust max_redirects or set allow_redirects=False. Total timeout spans all hops. Cross-origin redirects strip sensitive manual headers and then select destination-scoped cookies. One-shot streams are not replayed for 307/308. response.history holds earlier responses whose bodies were read and native requests closed.

## Synchronous sessions

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    response = session.get("https://example.com/", params={"page": 1})
    response.raise_for_status()
    print(response.status_code, response.http_version, response.url)
    print(response.text)
```

list_profiles() returns available canonical profiles. Creating a Session actually loads native code; import alone is insufficient installation validation. Reuse shares pools/cookies; context exit closes owned requests. response.match reports profile selection, not proof of complete browser equivalence.

Requests support headers, params, json, data, files, trailers, timeout, allow_redirects, and per-call profile. request(method,url,...) handles arbitrary methods; helpers include all seven common HTTP methods.

```python
from fastls import Session

with Session() as session:
    response = session.post("https://example.com/api", json={"hello": "world"})
    response.raise_for_status()
    print(response.json())  # The target must return valid JSON
```

json conflicts with data/files. data accepts text, bytes, form mappings, binary files, and byte iterators. files maps fields to tuples such as (filename,binary_file,content_type); the caller closes files. SDK encoders own length/framing and multipart Content-Type.

Responses expose content, text, json(), encoding, headers, wire_headers, and trailers. Headers are case-insensitive; get_list('Set-Cookie') retains duplicates. Trailers update after EOF. Text follows charset or UTF-8; encoding can be changed. HTTP status errors are explicit through raise_for_status().

## Streaming downloads

Ordinary request/get/post buffers up to **32 MiB**. Consume larger bodies incrementally:

```python
from fastls import Session, Timeout

with Session() as session:
    with session.stream("GET", "https://example.com/large.bin",
                        timeout=Timeout(total=300, read=30)) as response:
        response.raise_for_status()
        with open("large.bin", "wb") as output:
            for chunk in response.iter_bytes():
                output.write(chunk)
```

Always use a context manager so early exit releases resources. Each response has one reader; chunks are not lines, messages, or HTTP frames. Streamed bytes are not automatically retained as complete content; avoid mixing consumption modes.

gzip/deflate/br/zstd decode incrementally by default, including streams, with a 256 MiB decoded-output cap. Adjust max_decoded_bytes; decode_content=False returns raw bytes. wire_headers retains original fields, headers exposes the decoded view. See [timeouts/decoding](../reference/timeouts.md).

## asyncio

```python
import asyncio
from fastls import AsyncSession

async def main():
    async with AsyncSession(profile="chrome/156/windows") as session:
        response = await session.get("https://example.com/")
        response.raise_for_status()
        print(response.text)
        async with session.stream("GET", "https://example.com/large.bin") as streamed:
            streamed.raise_for_status()
            async for chunk in streamed.aiter_bytes():
                print(len(chunk))

asyncio.run(main())
```

await session.get/post/request returns a buffered response. Stream through aiter_bytes() or await aread(), and close explicitly with await aclose(). Do not share one AsyncSession across event loops. Cancellation/context exit releases requests.

When supported, per-session local notifications avoid Python network worker threads and Go-to-Python callbacks. notifications=required demands notification support; auto chooses, poll explicitly polls. The native library must still satisfy all current SDK transport requirements. Blocking synchronous file/iterator code still blocks its calling thread.

## Uploads and H2 duplex

```python
from fastls import Session, Timeout

with Session() as session:
    with open("large.bin", "rb") as source:
        response = session.post("https://example.com/upload", data=source,
                                timeout=Timeout(total=300, write=30))
        response.raise_for_status()
```

Binary files/byte iterators upload with backpressure; async byte iterators require AsyncSession. File ownership does not transfer. Streaming bodies cannot be replayed for 307/308. Do not set their Content-Length/Transfer-Encoding manually.

Choose a duplex-capable H2 target and enable duplex=True for simultaneous upload/download:

```python
import asyncio
from fastls import AsyncSession, Timeout

async def outgoing():
    for block in (b"first\n", b"second\n"):
        yield block
        await asyncio.sleep(0.1)

async def main():
    async with AsyncSession(profile="chrome/156/windows") as session:
        async with session.stream("POST", "https://example.com/exchange",
                                  data=outgoing(), duplex=True,
                                  timeout=Timeout(total=300, read=30, write=30)) as response:
            response.raise_for_status()
            async for chunk in response.aiter_bytes():
                print(chunk)

asyncio.run(main())
```

Duplex requires the fingerprinted H2 transport and disables automatic redirects. Response EOF ends the exchange and cancels unfinished upload; upload EOF permits continued response reads. wait_upload() means local producer completion/EOF acceptance, not server receipt; consume responses concurrently while waiting. Sync manual exchange uses Session.duplex(), send(), finish_upload(), and response. Sync stream(...,duplex=True) is unsupported. See [uploads](../reference/upload.md) and [duplex](../reference/duplex.md).

## SSE

```python
from fastls import Session, Timeout

with Session() as session:
    with session.sse("GET", "https://example.com/events",
                     timeout=Timeout(total=3600, read=45)) as events:
        for event in events:
            print(event.event, event.id, event.data)
            if event.data == "[DONE]":
                break
```

Async uses async with session.sse() and async iteration. event.json(), last_event_id, retry, and request last_event_id are supported. retry uses milliseconds. No automatic reconnect/replay occurs; [DONE] is application-defined. max_event_bytes defaults to 1 MiB for each line and accumulated event data. See [SSE](../reference/sse.md).

## WebSocket

```python
from fastls import Session

with Session(profile="chrome/156/windows") as session:
    with session.websocket("wss://example.com/chat") as websocket:
        websocket.send("hello")
        print(websocket.recv())
```

Async uses session.websocket() with awaited send/recv. Text is str; binary is bytes-like. Normal close raises WebSocketClosed with code/reason. For manual lifetime use ws_connect() (await async) and close/aclose().

Subprotocols, headers, params, proxies, and Session cookies are supported; cookie_mode=manual disables automatic cookie sending/updating for this handshake. Messages are buffered, default 1 MiB and maximum 16 MiB, not unbounded file streams. One reader and one writer can coexist; overlapping reads/writes fail.

RFC6455 Upgrade uses H1 with adapted ALPN, not an exact full browser handshake. No WS compression, H2/H3 Extended CONNECT, or reconnect. handshake_timeout/read_timeout/write_timeout/close_timeout use independent seconds budgets, not the HTTP lifetime. See [WebSocket](../reference/websocket.md).

## Configuration, errors, and cleanup

- **Timeouts:** HTTP total defaults to 30 seconds. Timeout(total=300,connect=10,headers=20,read=30,write=30) configures seconds. Total must be positive and at most 86400; it cannot be disabled. Other phases default to None. Read/write measure stalls, not whole transfer duration.
- **Errors:** FastlsTimeoutError.phase identifies timeouts; FastlsDecodeError marks decoding; FastlsHTTPError is raised explicitly and retains response. All derive from FastlsError. Validation/JSON may also raise standard Python exceptions.
- **Cookies/pools:** automatic cookies default on. Use get_dict(url), set/delete with URL scope, clear(), or cookies=False. Separate Sessions isolate state/pools. close_idle_connections() frees idle connections.
- **TLS:** verification is always enabled; no verify=False. ca_file replaces system roots for the Session, without changing system trust.
- **Proxies:** http/https CONNECT, socks5, and socks5h. Per-call proxy=None forces direct access. Environment proxies are ignored. proxy_ca_file trusts only an HTTPS proxy, independently of target ca_file. See [proxies](../reference/proxy.md).
- **Cleanup:** use matching sync/async contexts for Sessions, responses, SSE, and WS, including early exits. response.cancel() cancels one request; Session close cancels all owned requests.

Example URLs are placeholders for uploads/SSE/WS/duplex. The SDK does not provide complete requests/httpx compatibility or arbitrary TLS Spec input.

## Source development and licensing

The SDK-only sdist has no native library and never downloads/builds one during install or import. Follow [development](https://github.com/FastTLS/fastls-ffi/blob/main/DEVELOPMENT.md), build a library, and run python -m pip install -e ./python from the repository. An external ABI-v1 library must satisfy all current capabilities, not merely its ABI number.

Loading order: explicit Session library path → FASTLS_LIBRARY → bundled wheel library → source development dist/. Regular wheel users need no path override; stale environment values can mask a new installation.

[Apache-2.0](https://github.com/FastTLS/fastls-ffi/blob/main/python/LICENSE) and [third-party licenses](https://github.com/FastTLS/fastls-ffi/blob/main/python/THIRD_PARTY_LICENSES.txt) accompany distributions. See [PyPI maintenance](https://github.com/FastTLS/fastls-ffi/blob/main/PYPI.md) for publishing, and [authorized use/disclaimer](../legal.md) for usage boundaries. Software is provided as-is under its license; browser names imply no vendor endorsement or guarantee of anonymity, compatibility, or third-party acceptance.


---

Source: [FastTLS/fastls-ffi · python/README.md](https://github.com/FastTLS/fastls-ffi/blob/0f1aaa616e69282e48dee4ec9927c1516f80450f/python/README.md). Reviewed 2026-10-27; source revision `0f1aaa616e69`. Availability and advanced features depend on the installed release; see [release status](/en/releases/).
