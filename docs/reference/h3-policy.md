# 显式 H3 与可信地址策略

Python 0.6.0 / Node 0.15.0 增加原生 `http3_address_policy_v1` 组合能力。分别支持 H3 和地址策略，不代表支持组合。SDK 在创建 owner 或为已有策略 Session 逐请求选择 H3 前检查组合能力；旧库明确返回 `unsupported_capability`，不分配请求或静默忽略策略。C ABI、transport JSON、Spec 与 Bundle 仍为 v1。

```python
from fastls import Session

policy = {"allow_schemes": ["https"], "allow_hosts": ["api.example.com"],
          "allow_ports": [443], "deny_cidrs": ["127.0.0.0/8", "::1/128"]}
with Session(http_version="h3", address_policy=policy) as session:
    response = session.get("https://api.example.com/")
    response.raise_for_status()
```

```js
import { Session } from '@fastls/fastls';
const session = new Session({ httpVersion: 'h3', addressPolicy: {
  allow_schemes: ['https'], allow_hosts: ['api.example.com'], allow_ports: [443],
  deny_cidrs: ['127.0.0.0/8', '::1/128'],
} });
try { (await session.get('https://api.example.com/')).raiseForStatus(); }
finally { await session.closeAsync(); }
```

示例须替换为获准且实际支持 H3 的服务。空允许列表不限制该维度；示例拒绝列表不是完整 SSRF 防护。策略只由可信代码在 Session 创建时配置，复制后不可变，不能从普通请求 JSON 注入或放宽。Python 异步 Session、Node 独立 fetch 共用此契约。策略 Session 可逐请求选择 H3；强制 H3 的 Session 不能逐请求降级为 auto。

每次新建 QUIC 连接重新解析并检查全部 DNS 回答，任一地址禁止则在创建 socket 前拒绝；实际连接只接收该快照中的数字 IP/端口，不再次解析域名。解析和全部连接尝试共享最多 30 秒预算，调用方更短的请求/阶段时限优先。URL、HTTP authority、SNI 和证书名称保持原域名，SDK 默认校验证书。

connected UDP socket 在内核固定远端，PacketConn 同时拒绝其它写入目标（`peer_change_unsupported`）。策略路径不暴露原始/OOB/批量写入接口，不启用 ECN/GSO、连接迁移、服务端首选地址切换或 0-RTT。已批准的物理连接可复用，DNS 改变不会追溯撤销它；新连接必须验证新快照。请求、重定向及缓存分派前仍检查逻辑目标。握手失败、取消、连接结束和 Session 关闭释放所拥有的 socket，空闲关闭继续保护活动正文。

策略拒绝使用 `FastlsError.code == "address_denied"`；缺能力为 `unsupported_capability`，非法配置和请求策略注入明确拒绝。代理、H1/H2 Spec、q 指纹选择器、请求 Trailer、WebSocket、H2 双工仍不与此路径组合。没有 TCP 回退、自动 Alt-Svc、浏览器 H3 指纹、新增平台或服务协议扩展；无策略 H3 保留原路径。

更多见 [Go 地址策略](https://github.com/FastTLS/fastls/blob/main/ADDRESS_POLICY.md) 与 [English contract](/en/reference/h3-policy.md)。是否正式发布及平台验收范围以对应发行物与来源清单为准。

即使允许范围很宽，也在拨号前拒绝未指定目标地址（`0.0.0.0`、`::` 及映射零地址）：Go 可能将其解释为本机。该共享策略校验同时覆盖 H1/H2。

地址安全修正仅在本批核心源码与新原生库中生效。手动指定旧库或使用尚未重建的服务二进制，不会自动获得此修正。

## Go 源码版本

使用本批 SDK 固定的 Go 模块版本获得此组合能力：

```sh
go get github.com/FastTLS/fastls@v0.2.1
```


## 服务入口

Fetch/RPC v0.2.0 已独立接入显式 H3；上文 Python/Node 发行范围按原版本保留。服务字段、可信 CA 与限制见[服务升级](../releases/index.md)。MITM 不增加入站 H3。


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

RPC v0.3.1 保留请求上下文直到响应发送/统计结束，避免 unary 返回时提前取消；正常审计、较大响应及发送阶段上下文分别验证。Fetch 沿用已发布的 v0.3.0 原始归档。


## Go v0.2.0：H3 七项受控参数

Go v0.2.0 新增 `Options.HTTP3 *HTTP3Config`，必须同时选择 `HTTPVersion3`。Python 0.7.0 / Node 0.16.0 通过下文增量 ABI 接入；Fetch/RPC/MITM 仍保留各自字段与固定依赖。

```go
keepAlive := time.Duration(0)
session, err := fastls.NewSession(fastls.Options{
    HTTPVersion: fastls.HTTPVersion3,
    VerifyTLS: true,
    HTTP3: &fastls.HTTP3Config{
        InitialStreamReceiveWindow: 64 << 10,
        MaxStreamReceiveWindow: 1 << 20,
        InitialConnectionReceiveWindow: 128 << 10,
        MaxConnectionReceiveWindow: 2 << 20,
        MaxIdleTimeout: 30 * time.Second,
        KeepAlivePeriod: &keepAlive,
        MaxResponseHeaderBytes: 64 << 10,
    },
})
if err != nil { return err }
defer session.Close()
effective, ok := session.EffectiveHTTP3Config()
_, _ = effective, ok
```

以上为返回 error 的函数体片段，需要导入 `time` 和 `github.com/FastTLS/fastls`。`Options.EffectiveHTTP3Config()` 可在联网前校验并查询；`HTTP3Capabilities()` 返回七项名称、单位、默认与允许范围。

- 流初始/最大窗口默认 512 KiB / 6 MiB；连接初始/最大窗口默认 512 KiB / 15 MiB。四项均以字节计，零选默认，显式接受 4 KiB..64 MiB，规范化后初始值不得大于对应最大值。接收窗口限制未消费的流控额度，累计传输量与 MAX_DATA/MAX_STREAM_DATA 偏移可继续增长；不是进程总内存上限。
- `MaxIdleTimeout` 默认 30s，显式接受 100ms..24h 的整毫秒值，作用于本地握手后空闲。对端限制及 QUIC PTO 会影响实际时间；固定后端把收到的对端空闲参数至少按 5s 解析，所以服务器解析后的 qlog 可能显示 5s，而本地 400ms 配置仍会更早关闭。该快照不等于协商结果。
- `KeepAlivePeriod` 未填写为 min(10s, 本地空闲/2)，保留 H3 默认；指向零值关闭周期保活，显式非零接受 10ms..本地空闲/2。对端较短空闲可进一步缩短实际周期。关闭周期保活仍可能出现 QUIC 恢复/PTO PING。
- `MaxResponseHeaderBytes` 零为 10 MiB，显式 1 KiB..16 MiB。后端限制各个编码 HEADERS 帧和首部字段解码后的大小（含字段开销）；响应 Trailer 只有编码帧检查，不提供相同的解码总量上限。它不是首部与 Trailer 合计、正文、解压或总内存限额；正文读取、`MaxDecodedBytes` 与请求期限仍需独立设置。

非法范围、溢出、精度丢失、初始/最大冲突及不支持组合在 DNS/拨号前拒绝。nil 与空配置保留现有显式 H3 默认；非 nil 配置不能把 auto 或旧 q 选择器隐式切换为 H3。旧选择器不带新配置的行为保留。

创建 Session 和一次请求准备时复制输入（含保活指针目标），之后修改原配置或查询结果不会修改已有会话；调用方不得在准备期间并发写入。配置固定属于该 owner 的传输实例，不同 owner/配置/策略不共享 QUIC 传输，逐请求不能替换。修改参数需新建 Session。空闲关闭仍保护活动正文，取消/EOF/Close 回收上传与 socket，不取消兄弟请求或其它 owner。

证书/SNI、可信地址策略和固定数字 UDP 目标保持；请显式开启 `VerifyTLS: true`。代理、H1/H2 Spec、TCP TLS 覆盖、头序及请求 Trailer 的原冲突继续拒绝。保活不能延长总/阶段期限；浏览器 H3 指纹、任意 SETTINGS/QPACK/头序、0-RTT、UDP 代理仍另行开发。完整值域、真实对端证明与一次五分钟资源预算见 [Go H3 配置](https://github.com/FastTLS/fastls/blob/v0.2.0/H3_CONFIG.md)。

响应头超限后，即使后端已将连接移出复用表，也保留关闭所有权；活动兄弟正文完成后通知对端关闭，再销毁 UDP，避免等待对端空闲期限。

## Python 0.7.0 / Node 0.16.0：受控配置

SDK 原生库固定 Go v0.2.0，新增可选能力 `http3_config_v1`。C ABI 与 transport JSON 仍为 v1；旧库缺能力或新符号时，在分配 owner / 请求前返回 `unsupported_capability`。原有不带配置的用法仍可用。

```python
from fastls import HTTP3Config, Session, http3_capabilities

config = HTTP3Config(initial_stream_receive_window=64 << 10,
                     max_stream_receive_window=1 << 20,
                     keep_alive_period_ms=0, max_response_header_bytes=64 << 10)
with Session(http_version="h3", http3_config=config) as session:
    effective = session.effective_http3_config()
    response = session.get("https://api.example.com/")
    response.raise_for_status()
```

```js
import { HTTP3Config, Session, http3Capabilities } from '@fastls/fastls';
const config = new HTTP3Config({initialStreamReceiveWindow: 64 << 10,
  maxStreamReceiveWindow: 1 << 20, keepAlivePeriodMs: 0,
  maxResponseHeaderBytes: 64 << 10});
const session = new Session({httpVersion: 'h3', http3Config: config});
try {
  const effective = session.effectiveHTTP3Config();
  (await session.get('https://api.example.com/')).raiseForStatus();
} finally { await session.closeAsync(); }
```

主机必须替换为获准的 H3 服务；自定义 CA 在 Session 创建时配置。Python 使用蛇形字段，Node 使用驼峰字段；四个窗口与头部上限单位为字节，idle / keepalive 单位为毫秒。范围与上文 Go 契约相同：idle 100..86400000，显式保活为 0（关闭）或 10..idle/2；缺省保活为 min(10000, idle/2)，奇数 idle 可能返回半毫秒有效值，例如 101 → 50.5。输入只接受整毫秒，查询保留此规范化精度。

配置强类型、创建时复制并固定。`http3_capabilities()` / `http3Capabilities()` 在不创建 owner 或拨号的情况下查询字段；有效快照为只读本地值，不是协商结果。Python 同步/异步 Session、一次请求与 Node 独立 fetch 支持配置；已有 Session 的请求及 `Session.fetch` 不能替换。响应头与 Trailer 上限、总/阶段期限、取消和地址策略约束同上。窗口不是进程内存上限。

正式原生库的五个平台、Linux race 与一次五分钟资源检查集中验收；真实对端观测初始流/连接窗口及 idle，头部与 Trailer 拒绝、兄弟请求取消、配置隔离和旧库前置拒绝分别验证。固定 Go 发行的窗口/保活机制证据与 SDK 对端映射证据分开引用。见完整 [SDK H3 配置](https://github.com/FastTLS/fastls-ffi/blob/v0.7.0/H3_CONFIG.zh-CN.md)。Fetch 0.3.0、RPC 0.3.1、MITM 0.1.2 不随 SDK 自动升级核心。


## 2026-11-01：连接回收与交付收口

Go **v0.2.1**、Python **0.7.1**、Node **0.16.1** 候选、Fetch **v0.3.1**、RPC **v0.3.2**、MITM **v0.1.3** 使用同一最终核心，配套 profile **v0.1.1** 与 ftransport/imitate **v0.1.2**。核心默认入口为 main，v1/v2 分支与历史标签保留。

H3 错误或内部重拨后停止向旧连接所属传输代分配新请求；原正文只保留自己的代，后续请求不能拖延回收。保持长正文并连续拒绝 20 次过大响应头时，真实对端在长正文结束前关闭另外 19 条连接；直连/地址策略均覆盖。服务保留可信启动配置、审计和停机契约，不额外开放七项 SDK 请求字段。

Python 正式包装可提升同提交、同依赖/工具链/配置的认证原生字节；保留原 build-info/Go buildinfo，用独立 package-info 绑定外层与生产者身份，缺少或不等价证据仍构建并检查。上传与待确认分别记录，恢复不重置首次八分钟读取期限和最多三次发布尝试；支持只读确认。进度仅留 Actions，Release 草稿通过明确文件清单及摘要检查后再公开。

平台包先上传、并行等待元数据，五个平台摘要与可信来源全部验证后才上传主包。恢复默认不重置原期限；维护者明确授权预算例外后，可手动使用一次额外八分钟窗口，仍保留原始时间、最多三次逻辑尝试与每端点/阶段十五次累计读取。发布工具变更须证明生产输入和原归档不变。详见[恢复规则](https://github.com/FastTLS/fastls-ffi/blob/821fed9fed8a08d19fe0709bf227c283e9e537a0/node/NPM_RELEASE.md)。

本批集中开发后按最高风险统一验收；正式包装、标签和上传只补缺失的身份、安装、签名与线上证明。原 0.7.0 交付中 Node 保留原归档，Python 复用源码/资源证明但仍重编了原生库；该历史结果不当作新字节实测。详情见[交付契约](https://github.com/FastTLS/fastls-ffi/blob/v0.7.1/DELIVERY_LIFECYCLE.zh-CN.md)。
