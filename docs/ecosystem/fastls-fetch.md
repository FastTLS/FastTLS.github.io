# fastls-fetch


## 服务 0.1.2：地址策略与升级

独立二进制固定核心 `v0.1.3-0.20261030152832-0dc4eea0f32e`。通过 `-address-policy /trusted/path/policy.json` 在接受请求前加载严格的可信运维策略；默认关闭，请求 JSON 或请求头不能替换它，修改规则需重启。后端缺少能力时拒绝启动，旧二进制必须显式升级。

启用策略时，每个新连接先校验全部解析结果，再只拨获准的数字 IP，保留原域名的 TLS 身份。`0.0.0.0`、`::` 和 IPv4 映射零地址按 `invalid_ip` 拒绝，包括广泛允许与回环拒绝组合；空允许列表不代表自动封禁私网。配置见[地址策略说明](https://github.com/FastTLS/fastls-fetch/blob/main/ADDRESS_POLICY.md)。

Fetch、JSON-RPC 与 gRPC 保持 `address_denied` 结果封装；MITM 在 CONNECT 成功前拒绝禁止目标，SNI/解密请求绑定原 origin，每次出站仍由核心校验。预检不能授权后续未受控拨号。原证书设置仍适用，MITM 应启用 `-verify-cert`，私有 CA 应配置信任根。v0.2.0 新增显式出站 H3；UDP 代理与 Alt-Svc 仍不支持。

发行平台为 Linux/Windows/macOS 的 amd64/arm64。main 运行常规 CI，开发归档改为手动；正式构建要求同一提交 CI 成功，RPC 还要求服务联调成功，再一次构建各平台发行物。对实际下载字节验证摘要、签名来源、内嵌模块、版本/帮助与六平台真实策略行为。

[English documentation](https://fasttls.github.io/en/ecosystem/fastls-fetch)

基于 HTTP 的 FastTLS Fetch 服务。它把 URL、请求头、Cookie、代理和 TLS 指纹配置转换为一次服务端 HTTP 请求，并以统一 JSON 结构返回结果。

> 当前状态：`v0.3.0` 正式版。正式产物只在 GitHub Releases 发布；PyPI、npm、容器仓库等渠道不在发布范围内。

[使用文档](https://fasttls.github.io/ecosystem/) · [下载发布包](https://github.com/FastTLS/fastls-fetch/releases)

下载对应系统/架构的 Release 产物后校验 SHA-256 和来源证明，解压运行；普通用户无需安装 Go。只有从源码构建才需要下述 Go 工具链。

## 能力

- `POST /fetch`：发起 HTTP/HTTPS 请求
- `GET /health`：服务健康检查
- 浏览器预设、JA3、JA4R 指纹配置
- 请求级代理、重定向、超时、Cookie、User-Agent 和请求 Trailer 控制
- 自动响应解压和 CORS
- SIGINT/SIGTERM 安全停止，给活动 HTTP 请求最多 5 秒完成，超时后强制关闭
- 基于 `fastls` + `ftransport` 的独立依赖链，不再依赖 `fhttp`

## 环境要求

- Go 1.26 或更高版本；CI 同时覆盖 Go 1.26.10 和 1.27.3
- 使用仓库自己的 `go.mod`，建议设置 `GOWORK=off`

默认 `-addr :8800` 监听所有可用接口，并非仅环回；下面示例显式使用 127.0.0.1。开放访问前需配置访问控制。

## 从源码运行

```bash
git clone https://github.com/FastTLS/fastls-fetch.git
cd fastls-fetch
go mod download
go build -o fastls-fetch .
./fastls-fetch -addr 127.0.0.1:8800
```

Windows 使用 `go build -o fastls-fetch.exe .` 和 `fastls-fetch.exe -addr 127.0.0.1:8800`。

可用命令：

```bash
./fastls-fetch -help
./fastls-fetch -version
./fastls-fetch -addr 127.0.0.1:8800 -debug
```

## 快速请求

```bash
curl http://127.0.0.1:8800/health

curl -X POST http://127.0.0.1:8800/fetch \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://example.com/",
    "method": "GET",
    "browser": "chrome"
  }'
```

成功响应包含 `ok`、`status`、`protocol`、`final_url`、`headers`、`trailers` 和 `body`；`trailers` 在响应体读取完成后返回并保留多值。参数或上游请求错误通过 HTTP 状态码以及 `error` 字段返回。完整字段、错误和多语言示例见 [Fetch API 文档](https://github.com/FastTLS/fastls-fetch/blob/main/fetch_server_example.md) 与 [客户端示例](https://github.com/FastTLS/fastls-fetch/blob/main/example/README.md)。

## 指纹选择

建议使用随指纹库滚动更新的稳定别名：`chrome`、`edge`、`firefox`、`safari`、`opera` 或 `chromium`。需要固定实验条件时，也可以使用当前支持的版本化选择器，例如 `chrome150` 至 `chrome160`、`edge150` 至 `edge160`、`firefox151` 至 `firefox158`，以及兼容保留的历史选择器。

请求中的优先级为：显式 `fingerprint`（JA3/JA4R）高于 `browser`，均未设置时使用默认浏览器配置。无法解析的指纹或浏览器选择器会返回错误，不会静默伪装为另一个版本。

请求体也支持 `http2_settings_string` 和 `parent_proxy`。代理按 `X-Mitm-Proxy` > `parent_proxy` > `proxy` 取值；显式 HTTP/2 设置覆盖浏览器预设；调用方取消 `/fetch` 请求时，下游请求也会同步取消。

## 依赖关系

```text
fastls-fetch
  └─ fastls
      ├─ ftransport       HTTP/1.1、HTTP/2 传输（H3 为核心独立路径）
      ├─ fastls/profile   指纹模型
      └─ imitate          浏览器预设
```

CI 会拒绝本地 `replace` 指令和任何重新引入 `github.com/FastTLS/fhttp` 的依赖图。

## 测试与开发构建

本地最小验证：

```bash
go mod verify
go test ./...
go test -race ./...
go vet ./...
go build ./...
```

GitHub Actions 覆盖 Windows、Linux、macOS 与两个 Go 版本，并执行依赖策略、单元/集成测试、竞态检测、覆盖率、静态检查、全包构建和 CLI 冒烟测试。手动工作流生成保留 14 天的开发产物；`v*` 标签会用同一受审流程生成六个平台正式包、SHA-256 校验和和 Sigstore/GitHub 来源证明，并只发布到 GitHub Releases。

集成测试全部使用环回地址，覆盖请求体/请求头/Cookie、请求与响应 Trailer、最终协议/URL、压缩响应、禁用重定向、两级代理优先级、调用取消、CORS 预检和请求大小边界，不依赖公网服务。

测试套件还会现场构建并启动 `fastls-fetch`，通过真实 TCP 端口验证 `/health` 和 `/fetch`，避免只有进程内路由测试通过而 CLI 无法运行。

- [开发与贡献说明](https://github.com/FastTLS/fastls-fetch/blob/main/DEVELOPMENT.md)
- [开发产物及签发验证](https://github.com/FastTLS/fastls-fetch/blob/main/ARTIFACTS.md)

## 安全边界

该服务允许调用方指定目标地址和代理。JSON 请求体内置 4 MiB 上限，浏览器跨域请求会显式回显 `Origin` 后再允许凭据。不要把未加访问控制的实例暴露到不受信任网络；部署方仍应加入认证、目标地址策略、网络出口限制、更严格的资源限制和审计。

## 文档索引

- [Fetch API 文档](https://github.com/FastTLS/fastls-fetch/blob/main/fetch_server_example.md)
- [Python、Go、Node.js 客户端示例](https://github.com/FastTLS/fastls-fetch/blob/main/example/README.md)
- [开发流程](https://github.com/FastTLS/fastls-fetch/blob/main/DEVELOPMENT.md)
- [产物校验与来源证明](https://github.com/FastTLS/fastls-fetch/blob/main/ARTIFACTS.md)


## 不支持与部署责任

这是受控网络内的 HTTP 请求服务，不是完整浏览器、通用 VPN 或任意协议转发器。不能从核心的 HTTP/3 路径推断所有服务入口均支持 H3 指纹、代理组合或流式 RPC。默认示例不能替代认证、出口控制、租户隔离和流量限制。浏览器别名是服务适配层选择器，与 Go Provider 的规范 ID 不同；实际支持范围以该发布版本为准。

## 详细文档与问题反馈

- [使用文档](https://fasttls.github.io/ecosystem/)：安装、功能、参数与排错。
- [版本与发布说明](https://github.com/FastTLS/fastls-fetch/releases)：正式版本、开发版本和产物边界。
- [问题反馈](https://github.com/FastTLS/fastls-fetch/issues)：请提供版本、系统架构、脱敏后的最小示例与错误；不要提交凭据、Cookie、私钥或个人数据。

## 开源协议与第三方声明

FastTLS 自有代码采用 [Apache-2.0](https://github.com/FastTLS/fastls-fetch/blob/main/LICENSE)，见 [NOTICE](https://github.com/FastTLS/fastls-fetch/blob/main/NOTICE)。依赖及发布包内的第三方声明保留各自授权。

## 使用边界与免责声明

仅在拥有权限的系统、数据和网络上使用，并遵守适用法律、服务条款及隐私要求。软件按许可证约定以“现状”提供，不承诺可用性、特定用途适用性、第三方服务放行、匿名性或与真实浏览器完全一致。浏览器名称和版本用于描述配置，不表示获得相应厂商认证或背书。部署方负责访问控制、密钥和个人信息保护、请求限额及数据备份；担保排除与责任限制以随附许可证及适用法律为准。本说明不改变许可证授予的权利或新增许可限制。


---

来源：[FastTLS/fastls-fetch · README.md](https://github.com/FastTLS/fastls-fetch/blob/c6e3ec88119978e7de32141defef45f32198866a/README.md)。核对日期：2026-10-27；文档来源提交 `c6e3ec881199`。高级能力以实际安装版本为准。

## v0.1.1 升级说明（历史）

绑定 core v0.1.2、ftransport/imitate v0.1.1，profile 保留 v0.1.0。服务整合接入与解析资源边界、统一响应契约，以及默认关闭的脱敏审计。启用审计时需配置文件与停机预算，队列可能丢弃事件，不能把审计当成完整流量记录。配置及字段见 [审计说明](https://github.com/FastTLS/fastls-fetch/blob/v0.1.1/AUDIT.md)。

回滚应恢复经过验证的完整服务二进制与配置；需要地址策略的部署不能通过关闭策略恢复。


服务 v0.1.2 已包含接入资源名额、响应契约与默认关闭的有限审计；旧开发阶段说明不代表这些功能仍未发布。工具/文档维护复用经重新核验的源码证明，归档仍绑定实际生产提交。参见[验收与恢复](../releases/index.md)。

维护说明来源：[fastls-fetch documentation](https://github.com/FastTLS/fastls-fetch/blob/08bab98d01a7344129e547545fdc2e6b927bf060/DEVELOPMENT.md)；核对日期 2026-10-31。


## Fetch / RPC 0.2.0：显式出站 H3

Fetch、JSON-RPC、gRPC 新增 `http_version: "h3"`；省略/空值保留原 H1/H2。gRPC 使用新字段 16，旧字段和方法兼容。H3 要求 HTTPS，始终校验服务器证书；私有 CA 通过可信启动参数 `-h3-ca-file` 固定，普通请求不能改变信任或地址策略。

```json
{"url":"https://api.example.test/","http_version":"h3","method":"GET","timeout":5}
```

域名须替换为实际获准且支持 H3 的目标；JSON-RPC 将对象放入 params。H3 拒绝 browser、fingerprint（含 q）、H2 settings、proxy/parent_proxy、Fetch X-Mitm-* 控制头及请求 Trailer，不套用默认 Firefox 配置。没有 TCP/代理/Alt-Svc 回退；每次新连接仅向获准数字 UDP 地址拨号。响应协议为真实 HTTP/3.0，响应头/Trailer、正文、错误、超时和限额继续沿用。证书/上游失败保留 ok=false；配置错误分别为 Fetch 400、JSON-RPC -32602、gRPC InvalidArgument。

仅 Fetch/RPC 升版；MITM 保持 v0.1.2，不扩展入站 H3/QUIC 解密、浏览器 H3 指纹、UDP 代理或新平台。核心固定版本、Python 0.6.0 / Node 0.15.0 不变。详情见 [Fetch H3](https://github.com/FastTLS/fastls-fetch/blob/v0.2.0/H3.md) 与 [RPC H3](https://github.com/FastTLS/fastls-rpc/blob/v0.2.0/H3.md)。


H3 来源：[fastls-fetch H3 contract](https://github.com/FastTLS/fastls-fetch/blob/486973c7601dac79a511b1157a0cbf0274be1213/H3.md)


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
