# Session、请求与响应

Session 固定传输身份，可并发发起请求并复用连接。创建前设置好 profile、代理、目标 CA 和 CookieJar；改变传输身份应创建新 Session。完整导入示例见 [快速开始](index.md)。

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
response, err := session.DoContext(ctx, "https://example.com/api", fastls.RequestOptions{
    Headers: map[string]string{"Content-Type": "application/json"},
    Body: `{"message":"hello"}`,
    DisableRedirect: true,
}, "POST")
```

这里是接续已创建 session 的片段，需导入 context、time 和 fastls。Body 是文本；流式上传使用 io.ReadCloser 类型的 BodyReader，两者互斥。RequestOptions.Trailers 是 net/http.Header。用户头值覆盖默认值，重复响应头使用 HeaderValues，不能只看扁平 Headers。

## 响应与错误

Response.Status 是状态码，Protocol 是实际协议，FinalURL 是跳转后地址。先处理调用错误；返回值中若已有 Body 也需要关闭。调用成功后读取和关闭 Body，检查读取错误；HTTP 4xx/5xx 应由应用按状态决定是否失败。Trailer 在读到 EOF 后完整。

## 超时与关闭

Session 的总时限来自 DoContext 的 context，Options.Timeout 不适用于复用 Session。RequestOptions.Timeouts 设置 Connect、Headers、Read、Write 阶段预算，类型为 time.Duration；没有总时限时仍可能长期等待。Close 取消所属活动请求并阻止新请求；CloseIdleConnections 仅关闭空闲连接。勿在读取完正文前取消请求 context。

## 解压与流式

读取 Body 就是流式消费，不必先缓存全部。RequestOptions.DecodeContent 按需开启 gzip/deflate/br/zstd 解码，MaxDecodedBytes 限制解码结果；WireHeaderValues 保留原始头。上传生产者的 Close 必须能解除阻塞的 Read，才能完成取消清理。H2 双工需显式启用 Duplex，且目标也需支持并发收发。

Go 完整接口以 [Session 源码](https://github.com/FastTLS/fastls/blob/0dc4eea0f32ebc86b538f17cac383e80cd5c03eb/session.go)、[Options/Response](https://github.com/FastTLS/fastls/blob/0dc4eea0f32ebc86b538f17cac383e80cd5c03eb/index.go) 为准。源码分支新增行为须核对对应标签，不将 Python/Node 的参数原样用于 Go。


## H3 与可信地址策略

使用 `fastls.Options{HTTPVersion: fastls.HTTPVersion3, AddressPolicy: policy, VerifyTLS: true}` 组合显式 H3 与不可变策略。每个新 QUIC 连接校验全部 DNS 回答，再以 connected UDP socket 固定获准的数字目标，保留原域名的 SNI 和证书名称。本路径不启用 q 选择器、代理、迁移、ECN/GSO 或 0-RTT。见 [契约与 SDK 示例](../reference/h3-policy.md)。
