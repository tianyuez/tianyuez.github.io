# Tianyue Zheng Academic Website

这是一个用 Eleventy 构建的 GitHub Pages 学术网站。你只需要编辑 Markdown/YAML 内容，不需要修改 HTML 或 CSS。

## 修改论文

完整论文信息已经恢复为 [`src/publications/`](src/publications/) 下的 43 个本地 Markdown 文件。每篇论文的标题、作者、venue、年份和作者身份都在文件头部，直接修改对应文件即可。论文列表只提供 Google Scholar 查询链接，不保存 PDF、引用次数，也不会在构建时访问 Google Scholar。

首页 5 篇代表作是唯一需要人工维护的论文数据，位于 [`src/_data/site.yaml`](src/_data/site.yaml) 的 `selectedPublications`。这是为了保留指定的展示顺序，并覆盖 Scholar 作者行没有标记时仍需要明确展示的一作/通讯作者身份。

原始 jemdoc 中的作者标记已经转换：第一位 Tianyue Zheng 是第一作者，带 `*` 的非首位 Tianyue Zheng 是共同第一作者，带 `†` 的 Tianyue Zheng 是通讯作者。

## 修改其他内容

个人信息、新闻、研究关键词、经历、教育、项目、教学、服务、奖项和 alumni 在 [`src/_data/site.yaml`](src/_data/site.yaml)。首页关键词固定为：Embodied AI、Physical AI、Mobile Systems、Sensing System Security。

网站提供中英文按钮。默认只维护英文内容；GitHub Actions 会在构建阶段尝试使用 GitHub Models 更新中文翻译缓存。翻译服务不可用时继续使用已有缓存或英文，不会阻塞发布。

## 一键部署

把整个目录直接上传到 `tianyuez.github.io` 仓库，进入 **Settings → Pages** 将 Source 设置为 **GitHub Actions**。之后在 **Actions → Build and deploy website → Run workflow** 点一次即可构建发布；以后 push 到 `main` 也会自动发布。

工作流安装 Eleventy、可选更新中文翻译、检查 Markdown、输出 `_site` 并部署到 Pages，不依赖 Google Scholar 网络访问。

## 不影响正式网站的在线测试

在当前 GitHub 账号中新建一个普通公开仓库，例如 `website-preview`，不需要注册新账号。把同一份源码上传后运行 Actions，测试地址就是 `https://tianyuez.github.io/website-preview/`。原来的 `https://tianyuez.github.io/` 不会被修改或下线。

工作流会自动识别仓库名：在测试仓库使用 `/website-preview/` 子路径，在正式的 `tianyuez.github.io` 仓库使用 `/` 根路径，不需要手动修改配置。测试满意后，再把完全相同的源码上传到正式仓库运行 Actions 即可。

## 本地预览

```powershell
npm install
npm run dev
```

打开 `http://localhost:8080`。正式构建使用 `npm run build`，内容检查使用 `npm run check`。
