# 选择适合你的客户端

FastTLS 用于配置客户端的 TLS 握手、HTTP 协议参数和请求头顺序，适合协议研究、兼容性测试，以及需要控制请求行为的应用。你可以选择现成的浏览器配置，也可以在 Go 核心中使用自定义 JA3/JA4R 或完整 Spec。

## 按项目语言选择

- **Go**：使用 [Fastls](../fastls/index.md)，直接配置指纹和传输选项。浏览器配置需要显式提供生成器或离线 Provider。
- **Python**：使用 [Python SDK](../python/index.md)，通过同步或 asyncio 接口管理请求、Cookie 和流式响应。
- **Node.js**：使用 [Node.js SDK](../node/index.md)，通过 Promise API 接入，支持 TypeScript、ESM 和 CommonJS。当前提供开发版本，正式版 0.10.1 已完成验证，等待 npm 账号验证后上传。

Python 和 Node.js 的平台包内置原生库，普通安装不需要 Go、C 编译器或 RPC 服务。各语言的参数和默认行为有所差异，尤其要核对超时单位、TLS 验证和资源关闭方式。

需要通过 HTTP/gRPC 接入、调试代理流量或采集协议行为时，再选择 [配套工具](../ecosystem/index.md)。

## 建议阅读顺序

先完成所选语言的安装和首次请求，再了解会话、超时与响应处理。随后可 [按场景查找用法](../examples/index.md)，选择代理、文件传输、SSE 或 WebSocket。需要理解配置与真实网络行为的关系时，阅读 [指纹概念](../concepts/fingerprints.md)；安装或运行失败时，查看 [排错指南](../help/index.md)。

## 使用前确认

确认系统和架构有对应安装包，并实际创建 Session 验证加载。仅访问自己拥有或获准访问的目标；上传、SSE、WebSocket 和双工示例中的 URL 需要替换为提供对应协议的服务。

FastTLS 不启动浏览器或执行页面 JavaScript。浏览器配置描述的是已实现的网络参数，不代表真实浏览器全部行为已经复刻，也不保证第三方服务接受请求。

[支持范围](../concepts/support.md) · [版本与升级](../releases/index.md) · [许可证与免责声明](../legal.md)
