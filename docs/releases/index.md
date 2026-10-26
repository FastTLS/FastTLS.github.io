# 版本、安装渠道与升级

核对日期：2026-10-26。这里列出入门基线，不会自动跟随包管理器 dist-tag。

- Go Fastls：v0.1.1；github.com/FastTLS/fastls。生成器 imitate 为 v0.1.0，profile 和 ftransport 由模块依赖解析。
- Python：PyPI 的 fastls==0.1.3，导入名 fastls；历史 fastls-ffi 发行包先卸载再迁移。
- Node：npm 的 @fastls/fastls@0.10.1-dev.0；latest 与 next 当前均指向该开发版本，不等于稳定版。
- Fetch、RPC、MITM：GitHub Releases 的独立服务产物，与 Python/Node 包不是同一个安装入口。

## 升级步骤

阅读对应版本说明，在隔离环境固定新版本，实际创建 Session 并访问受控目标，验证代理、CA、Cookie、流式和取消，再替换部署。清理过期的 FASTLS_LIBRARY 和不匹配原生文件。生产回退应恢复成套包与配置，不只替换一个 DLL。

Go v2 是源码分支/实现代际名称，不是要求在模块路径添加 /v2。默认分支、开发分支、Actions artifact、本地导出、GitHub 预发布和正式 registry 包的状态不同；以实际发布资产、摘要和来源记录为准。

## 来源

[Fastls Releases](https://github.com/FastTLS/fastls/releases) · [SDK Releases](https://github.com/FastTLS/fastls-ffi/releases) · [Python 0.1.3](https://pypi.org/project/fastls/0.1.3/) · [npm](https://www.npmjs.com/package/@fastls/fastls)
