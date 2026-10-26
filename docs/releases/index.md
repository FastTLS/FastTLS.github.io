# 版本、安装渠道与升级

核对日期：2026-10-26。以下版本用于文档中的安装示例。建议固定版本安装；包管理器的默认标签可能变化，升级前先阅读对应发布说明。

- Go Fastls：v0.1.1；github.com/FastTLS/fastls。生成器 imitate 为 v0.1.0，profile 和 ftransport 由模块依赖解析。
- Python：PyPI 的 fastls==0.1.4，导入名 fastls；历史 fastls-ffi 发行包先卸载再迁移。
- Node：npm 的 @fastls/fastls@0.10.1-dev.0；latest 与 next 当前均指向该开发版本，不等于稳定版。
- Fetch、RPC、MITM：GitHub Releases 的独立服务产物，与 Python/Node 包不是同一个安装入口。

## Python 0.1.4 新增

支持 `fastls.request()`、`get()`、`post()`、`put()`、`patch()`、`delete()`、`head()` 和 `options()` 直接发起同步请求，每次调用自动关闭临时会话，返回已缓存的 Response。需要复用 Cookie、连接或流式读取时继续使用 Session / AsyncSession。

便捷方法提供完整的 IDE 关键字参数提示，Response 与 Headers 补齐常用类型注解；wheel 和 sdist 包含类型提示文件，支持 Python 3.10+，无新增运行依赖。详见 [一次性请求](../python/index.md#直接发起请求) 和 [发布说明](https://github.com/FastTLS/fastls-ffi/releases/tag/v0.1.4)。

## 升级步骤

阅读对应版本说明，在隔离环境固定新版本，实际创建 Session 并访问受控目标，验证代理、CA、Cookie、流式和取消，再替换部署。清理过期的 FASTLS_LIBRARY 和不匹配原生文件。生产回退应恢复成套包与配置，不只替换一个 DLL。

Go v2 是源码分支/实现代际名称，不是要求在模块路径添加 /v2。默认分支、开发分支、Actions artifact、本地导出、GitHub 预发布和正式 registry 包的状态不同；以实际发布资产、摘要和来源记录为准。

## 来源

[Fastls Releases](https://github.com/FastTLS/fastls/releases) · [SDK Releases](https://github.com/FastTLS/fastls-ffi/releases) · [Python 0.1.4](https://pypi.org/project/fastls/0.1.4/) · [npm](https://www.npmjs.com/package/@fastls/fastls)
