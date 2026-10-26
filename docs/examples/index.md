# 场景示例与阅读路径

## 普通请求、JSON 与文件

[Go 完整请求](../fastls/index.md)、[Go 请求选项](../fastls/session.md)、[Python 同步/异步与文件示例](../python/index.md)、[Node Promise 与文件示例](../node/index.md)。SDK 的请求参数细节见 [请求与响应](../reference/requests.md)。JSON 与表单/原始正文的互斥规则需按语言检查。

## Cookie 会话与代理

复用 Session 完成登录后续请求，勿每次重建会话。Cookie 会话并不代替应用认证与 CSRF 处理。[Cookie 与头部](../reference/cookies.md)、[连接池](../reference/pooling.md)、[HTTP/HTTPS/SOCKS 代理](../reference/proxy.md) 给出完整规则。代理 CA 与目标 CA 分开配置。

## 上传下载、并发与取消

大文件用 stream 逐块落盘，避免普通响应缓存上限。上传流需正确响应取消并关闭文件。[流式与超时](../reference/timeouts.md)、[上传](../reference/upload.md)、[H2 全双工](../reference/duplex.md)。Node 的自定义 Promise 生产者需要接收 AbortSignal，不能指望语言强制中止任意 I/O。

## SSE 与 WebSocket

[SSE](../reference/sse.md) 提供事件解析、last-event-id 和 retry；重连由应用决定。[WebSocket](../reference/websocket.md) 说明消息限制、关闭码、单读单写及独立阶段超时。example.com/events 和 /chat 是占位地址，需要替换为实际协议服务。
