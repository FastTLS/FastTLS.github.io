# 支持范围与差异

## Go 核心

支持 H1/H2、JA3/JA4R、完整 Spec、连接池、流式和代理。Go 指纹 TLS 的历史 VerifyTLS 零值关闭验证，必须显式开启。Session 的总超时依赖 context。

H3 是受限路径，不支持代理或任意浏览器 ClientHello 复刻。WS/WSS 使用 H1 Upgrade，不支持压缩及 H2/H3 Extended CONNECT。

## Python

Python 3.10+；同步/asyncio；HTTP 总超时默认 30 秒，所有 HTTP/WS 超时参数以秒为单位。默认验证 TLS，无 verify=False。wheel 支持 Windows x64、glibc 2.39+ Linux x64/ARM64、macOS 15+ x64/ARM64。无 Alpine/musl 内置包。

## Node.js

Node 22+ 主线程；Promise、TypeScript、ESM/CJS。超时以毫秒为单位。正式版 0.11.0 支持五种原生平台组合，系统最低版本以 native/manifest.json 为准。不支持 worker_threads、Electron、Bun、浏览器或 musl。默认验证 TLS。

## SDK 共同边界

Python 0.2.0（已发布）/ Node 0.11.0（已发布）将 Cookie、默认参数与重定向放在语言 SDK，动态库负责连接、指纹、证书和收发。Python 可选 requests 风格同步接口或 aiohttp 风格 ClientSession；Node 可选标准 fetch 响应接口。以常用迁移为目标，不宣称与参考库完全兼容。

## 协议与资源

Python 0.2.0 / Node 0.11.0 支持 H1/H2、完整自定义 Spec 和显式直连 HTTPS/H3。地址策略只能在可信 Session 创建时设置；H3 的不支持组合见版本页与能力契约。Session 缓冲响应最多 32 MiB；Node fetch 使用标准 Response 的内存行为，大正文应读取 body 流；自动解压默认结果上限 256 MiB。流式响应单读取者。SSE/WebSocket 不自动重连；WebSocket 不支持压缩、H2/H3 Extended CONNECT。HTTP 错误状态需显式调用 raise_for_status()/raiseForStatus()。

## 所有入口都不保证

不提供浏览器 DOM/JavaScript、验证码处理、匿名性、任意网站可用性或完整真实浏览器一致性。未知配置和不支持的组合应报错；不要把降级或一次请求成功当成指纹验证。
