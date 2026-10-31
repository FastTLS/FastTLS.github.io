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
go get github.com/FastTLS/fastls@v0.1.3-0.20261030152832-0dc4eea0f32e
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
