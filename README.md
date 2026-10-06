# Aster

Aster.H 的个人博客。写技术实践和项目复盘，记下日常，也收藏会反复打开的工具、网站与学习资料。

[访问博客](https://www.asterh.me/) · [订阅 RSS](https://www.asterh.me/rss.xml) · [GitHub 仓库](https://github.com/HuangJingwang/aster)

![Aster 首页白天主题](docs/screenshots/aster-home-light.jpg)

## 在这里读什么

- **文章与笔记**：技术实践、原理探索和阶段性总结，按年份浏览，也可以通过分类、标签、专题或搜索找到内容。
- **个人项目**：记录项目的用途、技术选择和进展，保留源码与相关链接。
- **推荐分享**：收藏网站、开源项目和文章，支持搜索与分类筛选。
- **刷题日记**：展示 LeetCode 进度、每日推荐、今日任务、复习轮次和题目笔记。

首页从个人介绍展开，接着是最近文章、个人项目和推荐资源。阅读页提供章节目录、阅读进度和相邻文章入口；文章列表支持最新／热门排序、筛选和分页。公开页面都有明暗主题，移动端通过顶部快捷导航切换主要栏目。

## 页面预览

截图采集自线上站点，更新于 2026 年 10 月 6 日（Asia/Shanghai），桌面视口为 1440 × 1000。

<details>
<summary>首页 · 夜间主题</summary>

![Aster 首页夜间主题](docs/screenshots/aster-home-dark.jpg)

</details>

<details>
<summary>文章列表</summary>

![Aster 文章列表](docs/screenshots/aster-posts-light.jpg)

</details>

<details>
<summary>文章阅读页</summary>

![Aster 文章阅读页](docs/screenshots/aster-article-light.jpg)

</details>

<details>
<summary>推荐分享</summary>

![Aster 推荐分享](docs/screenshots/aster-recommendations-light.jpg)

</details>

## 内容如何发布

Aster 由一人维护，内容、站点设置和图片跟代码一起放在仓库里。修改文件、提交到 GitHub，Vercel 会重新构建并发布网站。文章的修改记录、备份和回滚也沿用 Git 的流程。

仓库保留中文后台工作台，可以浏览内容、编辑和预览本地草稿。默认静态模式不开放在线保存，也不通过后台提交 GitHub 内容，因此不需要后台账号密码或 GitHub 内容写入 token。

![Aster 仓库驱动内容流](docs/diagrams/repository-content-flow.svg)

| 要修改的内容 | 文件位置 |
| --- | --- |
| 文章、笔记与项目记录 | `apps/web/content/public-content.json`，正文使用 `bodyMarkdown` 字段 |
| 站点信息与社交链接 | `apps/web/content/site-settings.json` |
| 推荐资源 | `apps/web/src/lib/recommended-shares.ts` |
| 刷题进度与学习记录 | `apps/web/content/leetcode/dashboard.json` |
| 素材索引 | `apps/web/content/assets.json` |
| 图片 | `apps/web/public/images/` |

仓库还提供两项内容工具：

```bash
# 预览尚未导入的掘金文章
npm run import:juejin -- --dry-run

# 导入文章，并将图片保存到仓库
npm run import:juejin -- --download-images

# 同步配置账号的 LeetCode 进度
npm run sync:leetcode
```

掘金导入脚本使用仓库中配置的作者账号。LeetCode 同步读取刷题数据中的 `settings.leetcodeUsername`，也可以传入 `--username <userSlug>`。运行后检查文件变化，再提交发布。

## 本地开发

需要 Node.js 22+ 和 npm 10+。

```bash
git clone https://github.com/HuangJingwang/aster.git
cd aster
npm ci
npm run dev:web
```

打开 [http://127.0.0.1:3000](http://127.0.0.1:3000) 查看网站，中文内容工作台位于 `/admin/content`。

常用检查在仓库根目录运行：

```bash
npm test
npm run typecheck
npm run build
```

技术栈为 Next.js 16（App Router）、React 19 和 TypeScript，使用 CSS 主题变量、Framer Motion 动效与 Lucide 图标。工作区由 npm workspaces 管理，共享类型和 Markdown 处理分别放在 `packages/shared` 与 `packages/markdown`。

```text
apps/web/                    公开页面、后台界面与路由处理
apps/web/content/            内容、设置与素材索引
apps/web/public/             图片、字体等静态资源
packages/shared/             共享类型与工具
packages/markdown/           Markdown 解析与渲染
workers/interactions-worker/ 可选互动服务
scripts/                     导入、同步、检查与备份工具
docs/                        部署、安全、迁移记录与截图
```

## 部署与互动

当前生产部署使用 GitHub + Vercel + 自定义域名。Vercel 项目使用以下设置：

```text
Root Directory: apps/web
Install Command: cd ../.. && npm ci
Build Command: cd ../.. && npm run build
Output Directory: Next.js default
```

安装与构建命令回到仓库根目录执行，让共享包先完成构建。生产环境设置 `PUBLIC_SITE_URL` 为实际网站地址，其他配置见 [部署说明](docs/deployment.md)。

评论、留言、点赞和浏览量保留独立的互动接口。接入运行时互动需要配置 Worker 地址：

```text
NEXT_PUBLIC_INTERACTION_BASE_URL=https://your-worker.example
INTERACTION_BASE_URL=https://your-worker.example
```

前者供浏览器使用，后者供服务端使用。Worker 当前为基础实现，接入前请阅读 [Worker 说明](workers/interactions-worker/README.md) 和 [安全说明](docs/security.md)。需要互动签名密钥时，运行 `npm run auth:interaction-secret` 生成并配置 `INTERACTION_HASH_SECRET`。

部署后检查首页、`/health` 和 `/admin/content`，也可以运行：

```bash
npm run ops:smoke -- https://your-domain.example
```

## 维护与备份

| 命令 | 用途 |
| --- | --- |
| `npm run ops:doctor` | 检查本地运行环境与配置 |
| `npm run ops:smoke` | 检查本地站点主要入口 |
| `npm run ops:backup` | 备份仓库内容与图片 |

备份默认写入带时间戳的 `backups/starry-summer-static-*` 目录。恢复会替换内容与图片目录，执行时指定实际备份路径并显式确认：

```bash
RESTORE_CONFIRM=YES npm run ops:restore -- backups/starry-summer-static-YYYY-MM-DD-HHMMSS
```

本地部署反馈工具的使用方式见 [Codex post-push watcher](docs/ops/codex-post-push-watcher.md)。

## 文档与参考

- [部署说明](docs/deployment.md)
- [安全说明](docs/security.md)
- [静态托管迁移记录](docs/static-hosting-migration.md)
- [部署与反馈流程图](docs/diagrams/deployment-feedback-flow.svg)

首页构图与交互参考了 [MotionSites](https://motionsites.ai/?prompt=3d-jack-portfolio-hero) 和 [React Bits Dock](https://reactbits.dev/components/dock)。早期布局参考了 [yysuni.com](https://www.yysuni.com/) 及其开源项目 [YYsuni/2025-blog-public](https://github.com/YYsuni/2025-blog-public)。

项目原名 Starry Summer，现用名称为 Aster。内部 npm 包名、备份目录前缀和历史文章中的旧名继续保留。
