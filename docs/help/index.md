# 安装与运行排错

## Python 找不到平台包

确认 Python >=3.10、解释器位数与平台要求匹配。Linux wheel 需要 glibc 2.39+，macOS 需要 15+，Alpine/musl 没有内置 wheel。使用 --only-binary=:all: 能明确暴露无匹配包，避免落入无动态库的 sdist。先在独立虚拟环境重现，完整命令见 [安装指南](../python/install.md)。

## 动态库加载失败或能力缺失

创建 Session 才能验证安装。检查 library 显式参数、FASTLS_LIBRARY 遗留值、进程架构及安装包平台。SDK 与库必须配套；仅 ABI 号相同不能证明支持新增能力。不要把旧 DLL 放到新 wheel 旁边试图覆盖。

## Node 缺少原生包

保留 optionalDependencies，不使用 --omit=optional；从支持的系统与主线程运行，主包和平台包必须同版本。不要把历史 @fasttls/fastls GitHub tarball 与 @fastls/fastls npm 包混装。系统要求、摘要或能力不符时应解决根因，勿绕过加载校验。

## TLS 或代理失败

确认系统时间、目标主机名和证书链。私有 CA 用 ca_file/caFile，HTTPS 代理 CA 用独立参数；指定的根替代系统根。Go 直接调用显式启用 VerifyTLS。检查代理协议、认证和目标解析方式；SDK 不读取环境代理。MITM 需分别配置客户端信任和上游目标验证。

## 读取、解压或超时失败

错误可能在响应头返回之后出现。普通 SDK 响应限制 32 MiB，大文件改 stream；解压数据仍受 max_decoded_bytes/maxDecodedBytes 约束。Python 超时是秒，Node 是毫秒，Go Session 使用 context。read/write 是进度停顿预算，并非完整正文累计时长。

## 进程资源未释放

关闭 Session、未消费完的流、SSE 与 WebSocket。不要同时读取同一响应。上传生产者必须支持取消；Node 等待任意用户 Promise 无法被强制中断。诊断 stats 的范围可能是库实例，不代表当前单一会话。

## 反馈问题

到对应源码仓库创建 Issue，提供包版本、系统/架构、最小代码、预期与实际结果、脱敏错误和复现步骤。不要上传凭据、Cookie、私钥或未脱敏抓包；潜在安全问题按组织安全政策私下报告。
