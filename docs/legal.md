# 开源协议与免责声明

## 按组件确认授权

Fastls、fastls/profile、imitate、ftransport、fastls-ffi、fastls-lab，以及 Fetch、RPC、MITM 服务的自有代码使用 Apache-2.0，各仓库提供对应 LICENSE 和声明。第三方源码与依赖保留原许可证。本文档站及示例采用 [Apache-2.0](https://github.com/FastTLS/FastTLS.github.io/blob/main/LICENSE)。

uTLS 保留 BSD-3-Clause，quic-go 保留 MIT；oohttp 保留 OONI、Go Authors 的 BSD 条款及 PATENTS 专利授权。图标、品牌资源或嵌入来源可能有独立规则，须看各仓库实际文件。

fhttp 的 Go 来源部分有 BSD 证据，但上游新增/修改代码授权范围未确认，不能把整个库认定为 BSD 或 Apache。当前核心已用 ftransport 替代它。指纹数据仓库目前发布的 FastTLS 自有说明采用 Apache-2.0，未来采集数据或第三方素材须逐项确认授权，不能由文档许可证推断。

分发二进制时保留许可证、版权、NOTICE、第三方声明和适用专利材料。摘要用于内容完整性，来源签名用于出处核验；两者均不等于安全或法律认证。

## 使用边界与免责声明

仅在拥有权限的系统、数据和网络上使用，并遵守适用法律、服务条款及隐私要求。软件按许可证约定以“现状”提供，不承诺可用性、特定用途适用性、第三方服务放行、匿名性或与真实浏览器完全一致。浏览器名称和版本用于描述配置，不表示获得相应厂商认证或背书。部署方负责访问控制、密钥和个人信息保护、请求限额及数据备份；担保排除与责任限制以随附许可证及适用法律为准。本说明不改变许可证授予的权利或新增许可限制。


## 安全与数据

勿提交真实 Cookie、访问令牌、CA 私钥、个人信息或未脱敏抓包。代理和请求服务须限制监听和调用权限，配合认证、出口策略、配额及审计。MITM 会解密授权流量，测试后及时清理信任配置并保护捕获资料。安全问题按 [组织安全政策](https://github.com/FastTLS/.github/blob/main/SECURITY.md) 报告。
