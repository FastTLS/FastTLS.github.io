# FastTLS 文档站

Fastls Go、Python 与 Node.js SDK 的官方使用文档。

- 线上地址：https://fasttls.github.io/
- 内容目录：docs/；中文为第一版主语言。
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

每次修改对应工具都要核对安装名、版本、系统要求、默认值、资源关闭和不支持能力。开发分支功能应标为未发布，不覆盖稳定版事实。源文档镜像旁记录来源提交，更新时一并刷新。不要把密钥、捕获原始敏感流量或内部地址写入公开文档。详细维护方式见 docs/maintenance.md。
