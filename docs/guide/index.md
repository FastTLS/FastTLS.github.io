# 从这里开始

FastTLS 是一组可配置 TLS/HTTP 网络参数的客户端和工具。选择浏览器配置可以控制已实现的协议参数；它不会启动浏览器、执行页面 JavaScript 或保证第三方服务放行。

## 选择入口

- Go 项目直接使用 [Fastls](../fastls/index.md)，需要显式提供指纹生成器或离线数据。
- Python 项目使用 [Python SDK](../python/index.md)，支持同步与 asyncio。
- Node.js 项目使用 [Node SDK](../node/index.md)，支持 Promise、TypeScript、ESM/CommonJS，目前是开发版本。
- 需要跨语言服务、授权代理或协议采集，阅读 [周边工具](../ecosystem/index.md)。

Python/Node 的平台包内置原生库，不需要 Go 或 RPC 服务。三种入口不是完全相同的 API；尤其注意超时单位、证书验证默认值和资源关闭方式。

## 建议阅读顺序

先完成所选语言的安装与快速开始，再读请求/响应和超时，随后按需选择代理、上传下载、SSE 或 WebSocket。需要解释网络配置时阅读 [指纹概念](../concepts/fingerprints.md)；遇到问题先看 [排错](../help/index.md)。

## 使用前确认

确认系统和架构有对应安装包；在实际 Session 中验证加载。仅访问自己拥有或获准访问的目标。使用示例中的 example.com 占位 URL 时，SSE、上传、WebSocket 和双工需要换成自己提供对应协议的服务。

[支持范围](../concepts/support.md) · [版本与升级](../releases/index.md) · [许可证与免责声明](../legal.md)
