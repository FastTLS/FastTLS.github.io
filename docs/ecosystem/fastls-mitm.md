# Fastls MITM 代理


## 服务 0.1.2：地址策略与升级

独立二进制固定核心 `v0.1.3-0.20261030152832-0dc4eea0f32e`。通过 `-address-policy /trusted/path/policy.json` 在接受请求前加载严格的可信运维策略；默认关闭，请求 JSON 或请求头不能替换它，修改规则需重启。后端缺少能力时拒绝启动，旧二进制必须显式升级。

每个新连接先校验全部解析结果，再只拨获准的数字 IP，保留原域名的 TLS 身份。`0.0.0.0`、`::` 和 IPv4 映射零地址按 `invalid_ip` 拒绝，包括广泛允许与回环拒绝组合；空允许列表不代表自动封禁私网。配置见[地址策略说明](https://github.com/FastTLS/fastls-mitm/blob/main/ADDRESS_POLICY.md)。

Fetch、JSON-RPC 与 gRPC 保持 `address_denied` 结果封装；MITM 在 CONNECT 成功前拒绝禁止目标，SNI/解密请求绑定原 origin，每次出站仍由核心校验。预检不能授权后续未受控拨号。原证书设置仍适用，MITM 应启用 `-verify-cert`，私有 CA 应配置信任根。服务 H3 选择、UDP 代理与 Alt-Svc 不在本版本范围。

发行平台为 Linux/Windows/macOS 的 amd64/arm64。main 运行常规 CI，开发归档改为手动；正式构建要求同一提交 CI 成功，RPC 还要求服务联调成功，再一次构建各平台发行物。对实际下载字节验证摘要、签名来源、内嵌模块、版本/帮助与六平台真实策略行为。

[English documentation](https://fasttls.github.io/en/ecosystem/fastls-mitm)

为经过授权的 HTTPS 调试与网络兼容性测试提供 HTTP 代理。代理解密客户端流量，再使用选定的 TLS/HTTP 配置连接目标；它能读取经过它的明文，必须作为敏感基础设施管理。

[完整代理说明](https://github.com/FastTLS/fastls-mitm/blob/main/MITM_PROXY.md) · [委托模式](https://github.com/FastTLS/fastls-mitm/blob/main/DELEGATE_EXAMPLE.md) · [发布包](https://github.com/FastTLS/fastls-mitm/releases)

## 安装与启动

从 Releases 下载匹配系统和架构的产物，按 [ARTIFACTS.md](https://github.com/FastTLS/fastls-mitm/blob/main/ARTIFACTS.md) 校验。普通用户无需 Go。从源码构建需要 Go 1.26+：

```sh
git clone https://github.com/FastTLS/fastls-mitm.git
cd fastls-mitm
go build -o fastls-mitm .
./fastls-mitm -addr 127.0.0.1:8888 -browser chrome -verify-cert
```

Windows 使用 `go build -o fastls-mitm.exe .` 和 `./fastls-mitm.exe`。查看当前版本的 `-help` 和 `-version`，不要把其它分支新增参数用于旧发布包。默认监听地址为 `:8888`，上述命令显式限定环回地址；历史默认目标证书校验为关闭，因此示例显式启用 `-verify-cert`。

## 首次请求

启动后生成 `mitm-ca-cert.pem` 与 `mitm-ca-key.pem`。仅把 CA 证书交给授权客户端，私钥留在代理端，不应提交仓库或分发。使用应用级信任，避免为短期测试改变系统全局信任：

```sh
curl --proxy http://127.0.0.1:8888 --cacert mitm-ca-cert.pem https://example.com/
```

`--cacert` 校验客户端到代理的证书；`-verify-cert` 校验代理到目标的证书，这是两条独立的 TLS 连接。不要用 `-k` 或关闭 Python verify 代替正确配置 CA。

Python 客户端示例（先安装 requests）：

```python
import requests

with requests.Session() as session:
    session.proxies = {"http": "http://127.0.0.1:8888", "https": "http://127.0.0.1:8888"}
    session.verify = "mitm-ca-cert.pem"
    response = session.get("https://example.com/", timeout=30)
    response.raise_for_status()
    print(response.text)
```

## 支持什么

- HTTP 代理、HTTPS CONNECT 后的授权 MITM、浏览器选择器、自定义 JA3/JA4R。
- 启动级及请求级配置、HTTP/2 设置、上级代理和委托模式，具体入口见详细说明。
- 在代理到目标一侧应用配置；客户端到代理的 TLS 由客户端决定。

## 不支持与风险边界

- 不是透明无解密隧道，也不是完整浏览器；不能保证通过风控或与任何真实浏览器完全一致。
- 证书固定、客户端自定义信任链或双向认证等场景可能拒绝 MITM，不能保证任意应用可接入。
- 不把此工具当作任意协议 VPN、HTTP/3/QUIC 代理或完备的多租户服务。
- 不要向不受信任网络开放未认证实例；日志、证书私钥和捕获流量均需控制访问。请求头配置应仅允许可信调用方设置。
- 历史详细说明中的选择器、默认值和示例须与安装版本的帮助对应。Windows curl 的证书/吊销行为随 TLS 后端和环境变化；优先配置信任与可用的吊销检查条件。

## 更多文档

[代理参数与行为](https://github.com/FastTLS/fastls-mitm/blob/main/MITM_PROXY.md) · [委托示例](https://github.com/FastTLS/fastls-mitm/blob/main/DELEGATE_EXAMPLE.md) · [客户端示例](https://github.com/FastTLS/fastls-mitm/blob/main/example/README.md) · [源码开发](https://github.com/FastTLS/fastls-mitm/blob/main/DEVELOPMENT.md) · [产物验证](https://github.com/FastTLS/fastls-mitm/blob/main/ARTIFACTS.md)

## 详细文档与问题反馈

- [使用文档](https://fasttls.github.io/ecosystem/)：安装、功能、参数与排错。
- [版本与发布说明](https://github.com/FastTLS/fastls-mitm/releases)：正式版本、开发版本和产物边界。
- [问题反馈](https://github.com/FastTLS/fastls-mitm/issues)：请提供版本、系统架构、脱敏后的最小示例与错误；不要提交凭据、Cookie、私钥或个人数据。

## 开源协议与第三方声明

FastTLS 自有代码采用 [Apache-2.0](https://github.com/FastTLS/fastls-mitm/blob/main/LICENSE)，见 [NOTICE](https://github.com/FastTLS/fastls-mitm/blob/main/NOTICE)。第三方依赖保留各自授权，分发时保留随包材料。

## 使用边界与免责声明

仅在拥有权限的系统、数据和网络上使用，并遵守适用法律、服务条款及隐私要求。软件按许可证约定以“现状”提供，不承诺可用性、特定用途适用性、第三方服务放行、匿名性或与真实浏览器完全一致。浏览器名称和版本用于描述配置，不表示获得相应厂商认证或背书。部署方负责访问控制、密钥和个人信息保护、请求限额及数据备份；担保排除与责任限制以随附许可证及适用法律为准。本说明不改变许可证授予的权利或新增许可限制。


---

来源：[FastTLS/fastls-mitm · README.md](https://github.com/FastTLS/fastls-mitm/blob/4074759048bd4375cf5d047538d892ff9d3154b9/README.md)。核对日期：2026-10-27；文档来源提交 `4074759048bd`。高级能力以实际安装版本为准。

## v0.1.1 升级说明（历史）

绑定 core v0.1.2、ftransport/imitate v0.1.1，profile 保留 v0.1.0。MITM 整合默认代理响应契约、取消与连接复用处理，以及默认关闭的脱敏审计。启用审计时需配置文件与停机预算，队列可能丢弃事件，不能把审计当成完整流量记录。配置及字段见 [审计说明](https://github.com/FastTLS/fastls-mitm/blob/v0.1.1/AUDIT.md)。

回滚应恢复经过验证的完整服务二进制与配置；需要地址策略的部署不能通过关闭策略恢复。
