# 版本、安装渠道与升级

核对日期：2026-10-27。以下版本用于文档中的安装示例。建议固定版本安装；包管理器的默认标签可能变化，升级前先阅读对应发布说明。

- Go Fastls：v0.1.1；github.com/FastTLS/fastls。生成器 imitate 为 v0.1.0，profile 和 ftransport 由模块依赖解析。
- Python：PyPI 当前正式版 fastls==0.1.4，导入名 fastls；历史 fastls-ffi 发行包先卸载再迁移。
- Node：npm 正式版 @fastls/fastls@0.10.1；主包与五个平台包的 latest 均指向 0.10.1。历史开发版保留用于追溯。
- Fetch、RPC、MITM：GitHub Releases 的独立服务产物，与 Python/Node 包不是同一个安装入口。

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
