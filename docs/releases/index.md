# 版本、安装渠道与升级

核对日期：2026-10-31。以下版本用于文档中的安装示例。建议固定版本安装；包管理器的默认标签可能变化，升级前先阅读对应发布说明。

- Go Fastls：v0.2.0；github.com/FastTLS/fastls。依赖保持固定版本，详见该标签 go.mod；不自动更新独立生成器、SDK 或服务。
- Python：PyPI 当前正式版 fastls==0.6.0，导入名 fastls；历史 fastls-ffi 发行包先卸载再迁移。
- Node：npm 正式版 @fastls/fastls@0.15.0；主包与五个平台包的 latest 均指向 0.15.0。历史开发版保留用于追溯。
- Fetch、RPC、MITM：GitHub Releases 的独立服务产物，与 Python/Node 包不是同一个安装入口。

H3 与策略组合使用 Go 核心 `v0.1.3-0.20261030152832-0dc4eea0f32e`；旧稳定标签不代表包含此能力，见 [固定来源与限制](../reference/h3-policy.md)。




## Go v0.2.0：受控 H3 配置

七项参数、能力查询、有效配置快照和会话隔离仅在 Go 新增。`go get github.com/FastTLS/fastls@v0.2.0`；显式 H3 要求和值域见 [H3 契约](../reference/h3-policy.md)。三系统双工具链、Linux race、独立消费者与一次五分钟资源观察统一验收；标签复用同一提交的 main 验收。Python 0.6.0、Node 0.15.0、Fetch 0.3.0、RPC 0.3.1、MITM 0.1.2 保持原始发行字节与固定核心。


## Fetch 0.3.0 / RPC 0.3.1：可选协作停机

Fetch、JSON-RPC、gRPC 新增可信启动参数 `-shutdown-cancel-after 1s`。默认 `0` 关闭，保留五秒正常排空、超时强制失败；启用值必须大于 0 且小于 5s，非法值在监听前拒绝。该配置不接受请求 JSON、Protobuf 或请求头覆盖。

收到停止事件后立即停止接入，已开始的上游请求先正常排空；到指定间隔主动取消剩余请求，并等待处理器/解码、正文、上传源及并发名额实际释放。排空、取消、回收与审计共用停止时刻起的五秒绝对期限；`-audit-drain-timeout` 可以进一步缩短审计等待，不能重置总预算。正常完成和协作取消且回收成功退出 0；不合作处理器、未完成的传输握手、审计失败或最终强制兜底仍非零退出。关闭模式保留原独立审计预算。

```sh
fastls-fetch -addr 127.0.0.1:8800 -shutdown-cancel-after 1s -audit-file /private/fetch.jsonl
fastls-jsonrpc -addr 127.0.0.1:8801 -shutdown-cancel-after 1s
fastls-grpc -addr 127.0.0.1:8802 -shutdown-cancel-after 1s
```

取消保留原请求期限与调用方取消语义，不取消其它实例；已入站但仍在解码的请求不能在停止后新发上游。HTTP 慢正文通过读期限解除阻塞，不能中断的解码仍保留名额直到实际结束。取消结果沿用原通道：Fetch `ok=false/error_code=cancelled`，JSON-RPC 返回相同结果字段；gRPC 活动调用可返回 `Canceled`。传输已关闭时调用方也可能收到连接错误，不能承诺一定收齐响应。审计保留取消分类，不记录正文或敏感请求字段。

Unix 支持 SIGINT/SIGTERM；Windows 控制台支持 Ctrl+C/Ctrl+Break，实际验收使用独立隐藏控制台的 Ctrl+Break。没有增加 Windows 服务管理器集成、远程停止 API 或强杀后的优雅保证。三入口、H1/H2/H3、正常/协作/强制路径分别验证；Linux 一次五分钟混合协议观察之后追加停机，分别记录时长。MITM v0.1.2、核心固定版本、Python 0.6.0 / Node 0.15.0 保持，未增加新协议或平台。


## Fetch / RPC 0.2.0：显式出站 H3

Fetch、JSON-RPC、gRPC 新增 `http_version: "h3"`；省略/空值保留原 H1/H2。gRPC 使用新字段 16，旧字段和方法兼容。H3 要求 HTTPS，始终校验服务器证书；私有 CA 通过可信启动参数 `-h3-ca-file` 固定，普通请求不能改变信任或地址策略。

```json
{"url":"https://api.example.test/","http_version":"h3","method":"GET","timeout":5}
```

域名须替换为实际获准且支持 H3 的目标；JSON-RPC 将对象放入 params。H3 拒绝 browser、fingerprint（含 q）、H2 settings、proxy/parent_proxy、Fetch X-Mitm-* 控制头及请求 Trailer，不套用默认 Firefox 配置。没有 TCP/代理/Alt-Svc 回退；每次新连接仅向获准数字 UDP 地址拨号。响应协议为真实 HTTP/3.0，响应头/Trailer、正文、错误、超时和限额继续沿用。证书/上游失败保留 ok=false；配置错误分别为 Fetch 400、JSON-RPC -32602、gRPC InvalidArgument。

仅 Fetch/RPC 升版；MITM 保持 v0.1.2，不扩展入站 H3/QUIC 解密、浏览器 H3 指纹、UDP 代理或新平台。核心固定版本、Python 0.6.0 / Node 0.15.0 不变。详情见 [Fetch H3](https://github.com/FastTLS/fastls-fetch/blob/v0.2.0/H3.md) 与 [RPC H3](https://github.com/FastTLS/fastls-rpc/blob/v0.2.0/H3.md)。

## 验收与发布恢复维护（不新增版本）

服务与 SDK 的运行版本保持上述正式版本。仅受控工具/文档变化时，发行门禁重新核对可信 main 祖先、原生输入、执行配置、平台/工具链和完整成功任务；RPC 的跨仓契约另行核对。未知或生产输入变化恢复相应测试。旧证明保留原生产者身份，不表示新字节已经实测。

npm 部分发布恢复会先验证全部精确版本、摘要、Sigstore 签名及可信来源，主包继续最后处理。网络/registry 传播有期限和次数限制；401/403、内容或来源冲突停止。指定透明日志临时读取失败可仅重排失败任务，同运行最多三次，不改标签或自动升版；正式上传继续使用 GitHub Actions OIDC，不使用本机登录回退。见 [维护与恢复说明](https://github.com/FastTLS/fastls-ffi/blob/main/node/NPM_RELEASE.md)。

服务安装证明归档仅包含摘要、JSON、身份和日志，并区分运行/尝试；官方原归档保留在 Releases。工具维护对未变产物可选择 Linux/Windows 只读验证，实际新发布仍覆盖对应平台。资源机制未变时不重复五分钟、150 轮或小时观察；失败和原始报告仍保留。


## Fetch / RPC / MITM 0.1.2

三个服务固定核心 `v0.1.3-0.20261030152832-0dc4eea0f32e`，在启用地址策略时于拨号前拒绝未指定目标，保持可信启动策略、默认行为及协议限制。旧服务二进制不会自动获得修正。六平台正式归档检查覆盖 RPC 双入口、签名来源与实际策略请求；开发归档改为手动，复用同一 main 提交成功验收后只构建一次正式包。配置与升级见 [Fetch](../ecosystem/fastls-fetch.md)、[RPC](../ecosystem/fastls-rpc.md)和 [MITM](../ecosystem/fastls-mitm.md)。

## Python 0.6.0 / Node 0.15.0

新增显式 H3 与可信 Session 地址策略组合、固定数字目标 UDP 拨号及 `http3_address_policy_v1` 组合能力。ABI/schema 保持兼容，不升级依赖；无策略 H3 和既有 H1/H2 行为保持。见 [契约](../reference/h3-policy.md) 与正式 [Python 发行物](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.6.0) / [Node 发行物](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.15.0)。

## Python 0.5.0 / Node 0.14.0

新增完整 Spec 的 H2 首流编号和初始流接收窗口，贯通原生能力、共享转换及显式浏览器候选。见 [H2 配置](../reference/browser-profiles.md) 与 [发行物](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.5.0)。

## Python 0.4.0 / Node 0.13.0

新增 Go 共用的 JA3/H2 到完整 Spec 转换、ABI v1 可选能力、Firefox 159.0 Windows 实测配置更新，以及只读手动版本发现、采集、回放和离线候选。既有 API 保持兼容，已知 H2 流级差异保留，不自动启用或发布配置。参见[完整说明](../reference/browser-profiles.md)。


[Python 0.4.0](https://pypi.org/project/fastls/0.4.0/) · [Node 0.13.0](https://www.npmjs.com/package/@fastls/fastls/v/0.13.0) · [Python assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.4.0) · [Node assets](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.13.0)

## Python 0.3.0 / Node 0.12.0

2026-10-30 发布。Python 新增 Basic/Bearer 认证、逐请求 Cookie 与原子会话合并；两种 SDK 新增默认关闭的业务重试、显式正文工厂及离线 ProfileBundle/ProfileStore 配置固定/回滚。总时限、取消与正文可重放规则覆盖整个跳转链；ABI v1 和既有默认行为保持兼容。原生来源、模块依赖与未修改服务分别记录。

[Python 0.3.0](https://pypi.org/project/fastls/0.3.0/) · [Node 0.12.0](https://www.npmjs.com/package/@fastls/fastls/v/0.12.0) · [SDK assets](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.3.0) · [Node archives and signatures](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.12.0) · [Contract and examples](../reference/reliability.md)

证书/策略拒绝、取消、一次性上传及响应正文读取失败不重试；非幂等方法须显式授权。离线摘要校验完整性，不认证发布者；导入不联网。浏览器 H3 指纹、UDP 代理、Alt-Svc、在线浏览器采集和新增平台继续保留后续，维持既有五个平台。

## Python 0.2.0 / Node 0.11.0

2026-10-29 发布。本次新增可信 Session 地址策略、完整 profile Spec 快照和显式 HTTP/3，接入 C ABI、Python 同步/异步以及 Node Session/fetch。ABI v1 和旧默认请求保持兼容；旧原生库会在发请求前拒绝不支持的新选项。

[Python 0.2.0](https://pypi.org/project/fastls/0.2.0/) · [Node 0.11.0](https://www.npmjs.com/package/@fastls/fastls/v/0.11.0) · [Node 原始包与签名](https://github.com/FastTLS/fastls-ffi/releases/tag/node-v0.11.0) · [正式 SDK 资产](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.2.0) · [能力契约](https://github.com/FastTLS/fastls-ffi/blob/v0.2.0/CAPABILITIES.md)

SDK 核心依赖固定为公开版本 v0.1.3-0.20261029044750-32699153caa1。

H3 限定直连 HTTPS，失败不回退 TCP；不能与代理、地址策略、H1/H2 指纹、请求 Trailer、WebSocket 或 H2 双工组合。浏览器 QUIC 指纹、UDP 代理、自动 Alt-Svc 和通用重试仍是后续范围。服务和未改动组件不重发。

Python 保持五个平台 wheel 和一个 SDK-only sdist；Node 保持主包与五个平台包。npm 使用 GitHub Actions OIDC，PyPI 使用可信发布。来源、摘要、五平台安装与发布后 registry 安装分别核验，不把开发包改名为正式包，也不把历史资源观测当成新字节认证。

## Python 0.1.5 / Node 0.10.2 / 服务 v0.1.1

2026-10-28–29 分批发布。SDK 绑定真实正式模块图，原生库与安装包记录来源提交、模块校验值及许可证摘要。core v0.1.2 和 ftransport v0.1.1 整合连接生命周期、取消及响应契约修复；imitate v0.1.1 为许可证材料修订，profile 保留 v0.1.0。Fetch、RPC、MITM v0.1.1 整合接入/解析边界、统一响应契约及默认关闭的脱敏审计。

[Python 0.1.5](https://pypi.org/project/fastls/0.1.5/) · [Node 0.10.2](https://www.npmjs.com/package/@fastls/fastls/v/0.10.2) · [SDK 正式资产](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.1.5)

Python 保持五个平台 wheel 和一个 SDK-only sdist；Node 保持主包与五个平台包。ABI、语言安装入口和默认配置不变。SDK 地址策略和完整 Spec 接口仍未实现，本次没有新增 H3 或浏览器一致性承诺。原生库按正式标签构建后重新验证，不能将开发包重命名为正式包。

## Python 0.1.4 / Node 0.10.1

Python 0.1.4 和 Node.js 0.10.1 发布于 2026-10-27。Python 提供五个平台的内置动态库 wheel，以及仅含 SDK 的源码包；Node.js 提供主包和五个平台包。

CI 结果、文件摘要和上传方式见 [PyPI 发布记录](https://github.com/FastTLS/fastls-ffi/blob/main/PYPI.md)和 [npm 发布记录](https://github.com/FastTLS/fastls-ffi/blob/main/node/NPM_RELEASE.md)。

Python 新增 aiohttp 风格 `ClientSession`；Node 新增标准 `fetch` / `Session.fetch`。Cookie、默认参数、重定向由各语言 SDK 管理，动态库只承担传输资源与 TLS。

支持 `fastls.request()`、`get()`、`post()`、`put()`、`patch()`、`delete()`、`head()` 和 `options()` 直接发起同步请求，默认完整缓存后关闭临时会话；stream=True 则在关闭响应时释放临时会话。需要复用 Cookie 和连接时使用 Session / AsyncSession。

便捷方法提供完整的 IDE 关键字参数提示，Response 与 Headers 补齐常用类型注解；wheel 和 sdist 包含类型提示文件，支持 Python 3.10+，Cookie 公共后缀校验新增 publicsuffixlist 依赖。详见 [一次性请求](../python/index.md#直接发起请求) 和 [发布说明](https://github.com/FastTLS/fastls-ffi/blob/main/RELEASE_NOTES_0.1.4.md)。

## 升级步骤

阅读对应版本说明，在隔离环境固定新版本，实际创建 Session 并访问受控目标，验证代理、CA、Cookie、流式和取消，再替换部署。清理过期的 FASTLS_LIBRARY 和不匹配原生文件。生产回退应恢复成套包与配置，不只替换一个 DLL。

Go v2 是源码分支/实现代际名称，不是要求在模块路径添加 /v2。默认分支、开发分支、Actions artifact、本地导出、GitHub 预发布和正式 registry 包的状态不同；以实际发布资产、摘要和来源记录为准。

## 来源

[Fastls Releases](https://github.com/FastTLS/fastls/releases) · [SDK Releases](https://github.com/FastTLS/fastls-ffi/releases) · [Python 已发布版本](https://pypi.org/project/fastls/) · [npm](https://www.npmjs.com/package/@fastls/fastls)

RPC v0.3.1 保留请求上下文直到响应发送/统计结束，避免 unary 返回时提前取消；正常审计、较大响应及发送阶段上下文分别验证。Fetch 沿用已发布的 v0.3.0 原始归档。
