# FastTLS 文档站

Fastls Go、Python 与 Node.js SDK 的官方使用文档。

- 线上地址：https://fasttls.github.io/
- 内容目录：`docs/` 为简体中文，`docs/en/` 为完整英文版本；导航栏可切换到对应页面。
- 文档与示例采用 [Apache-2.0](LICENSE)，第三方声明见 [NOTICE](NOTICE)。

## 本地预览与检查

需要 Node.js 22+：

```sh
npm ci
npm run check:links
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## 发布

main 更新后由 GitHub Actions 构建发布。仓库 Settings → Pages → Source 选择 GitHub Actions。组织站点 base 为 `/`。构建失败或链接失效时不发布；PR 只构建检查。

## 内容维护

每次修改对应工具都要核对安装名、版本、系统要求、默认值、资源关闭和不支持能力。开发分支功能应标为未发布，不覆盖稳定版事实。源文档镜像旁记录来源提交，更新时一并刷新。不要把密钥、捕获原始敏感流量或内部地址写入公开文档。详细维护方式见 [文档维护](docs/maintenance.md)。

`translations.json` 记录全部中英文对应页和审阅时的内容摘要。更新中文正文后同步修改英文，审阅示例、参数和限制后再刷新摘要。`check:links` 会检查语言对应、翻译来源是否过期、站内链接和标题锚点，CI 检查通过才部署。
