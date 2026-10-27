# 指纹、配置与请求头

网络指纹是对协议行为的观察，不是单一身份凭证。相同 JA3/JA4R 字符串不代表请求头、H2 帧、TLS 扩展内容、随机策略和浏览器行为完全相同。

## 三种配置入口

- JA3 描述部分 TLS 字段；JA4 的哈希结果不能反推出可发送的完整 ClientHello。核心支持的是可解析的 JA4R 描述。
- 完整 profile.Spec 显式描述已支持的 TLS/HTTP 参数，后端会验证能力；未知或不支持的内容不能靠改名字获得实现。
- imitate Provider 按规范 ID 解析配置并生成默认身份头。浏览器 ID 格式是 product/version/platform[/variant]，例如 chrome/156/windows；可用集合由安装版本决定。

## 各组件分工

imitate 生成配置，fastls/profile 定义数据规范，Fastls 校验并发送请求，Python/Node 通过 ABI 调用 Fastls。fastls-fingerprints 用于证据/数据，fastls-lab 用于独立观察。配置登记、握手成功与真实浏览器一致性是不同证据层级。

## 请求头覆盖

用户显式头值优先于生成默认值，包括空字符串。改变 User-Agent 不会自动改变 TLS 配方，也不代表其余 Client Hints 都已重新生成。Go Provider 使用规范 ID；Fetch/RPC/MITM 的 chrome 等短名由服务适配层解析，两者不能混用。

请求头顺序只排列已存在的字段，不会自动生成默认值。不同配置提供的默认头可能不同；自动解压也不等于自动设置 `Accept-Encoding`。显式设置的示例见 [Python](../python/index.md#设置浏览器请求头) 和 [Node](../node/index.md#设置浏览器请求头)。

## 协商能力与广告声明

声明某个算法编号不等于后端实现了相应密码学验证。尤其 ML-DSA 等仅广告能力不能写成已支持验证。平台、补丁版和导航场景的实测证据不可推广到所有版本与请求。需要精确实验时固定工具版本、配置 ID、数据修订和目标协议。

[Go 指纹应用与离线注册](../fastls/profiles.md) · [完整 Spec](../fastls/profile-spec.md) · [imitate](../ecosystem/imitate.md)
