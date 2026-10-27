# 配套工具与项目

在应用里发送请求，优先使用 Go、Python 或 Node.js 客户端。需要部署独立请求服务、调试代理流量或观察线上协议参数时，再选择以下工具。

- [Fetch](fastls-fetch.md)：POST /fetch 的 HTTP JSON 服务，适合简单跨语言调用。
- [RPC](fastls-rpc.md)：JSON-RPC 与 gRPC 服务，支持标准客户端工具链。
- [MITM](fastls-mitm.md)：经授权的 HTTPS 调试代理，可读取中转明文，必须保护 CA 私钥和访问入口。
- [imitate](imitate.md)：独立配置生成器，不发送 HTTP 请求。
- [ftransport](ftransport.md)：标准 net/http 类型的 H1/H2 可配置传输。
- [fastls-lab](fastls-lab.md)：独立采集 TLS/H1/H2/WS/WSS 的有限观察；不是全协议认证平台。

## 历史与数据仓库

[fastls-fingerprints](https://github.com/FastTLS/fastls-fingerprints) 尚未发布数据集。[fhttp](https://github.com/FastTLS/fhttp) 与 [oohttp](https://github.com/FastTLS/oohttp) 是历史分支，当前核心使用 ftransport。fhttp 上游新增/修改代码授权范围尚未确认，不应表述为整个库已获 BSD/Apache 授权。

[uTLS](https://github.com/FastTLS/utls) 和 [quic-go](https://github.com/FastTLS/quic-go) 是上游派生仓库；Go module 仍可能保留上游路径。只有在理解分支差异与兼容要求时才直接使用它们，普通 SDK 用户无需单独安装。
