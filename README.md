# 中文开放网站资源目录

Chinese Open Web Directory

![网站](https://img.shields.io/badge/%E7%BD%91%E7%AB%99-1507-2ea44f)
![YouTube 频道](https://img.shields.io/badge/YouTube%20%E9%A2%91%E9%81%93-69-red)
![专题](https://img.shields.io/badge/%E4%B8%93%E9%A2%98-30-blue)
![License](https://img.shields.io/badge/license-MIT-green)

这是一个面向中文读者的公开网站资源目录数据集，覆盖新闻、学术研究、开发者工具、AI 工具、开放数据、社区、媒体、播客和日常工具。

这个数据集驱动 [ifanqiang.com](https://ifanqiang.com)：一个给中文读者使用的公开网站导航目录。

这个项目是：

- 给中文读者使用的公开网站资源数据集。
- 可以直接在 GitHub 上阅读和点击的 Markdown 目录，不需要先下载 CSV。
- 按新闻、学术、AI、开发者资源、开放数据、社区、媒体、播客、生活工具等场景组织的结构化数据。

这个项目不是：

- VPN、代理、机场或绕过访问限制的教程。
- 灰产、成人、赌博、盗版或不安全链接集合。
- 对任何网站在任何网络环境下都能访问、不能访问、被阻断或未被阻断的声明。

最近一次生产数据导出时间：`2026-06-21T23:56:17.348Z`

## 项目简介

中文开放网站资源目录收录的是适合中文读者发现、收藏和长期使用的公开网站入口。这里优先收录官方站点、媒体来源、研究数据库、开发文档、开放数据入口、社区、软件资源、播客和 YouTube 频道。

这个仓库的首要目标是“直接可读”。人类读者优先看 [sites/](sites/)、[youtube/](youtube/) 和 [topics/](topics/) 里的 Markdown 页面；程序和自动化脚本可以读取 [data/](data/) 里的 JSON、CSV 和纯 URL 列表。

## 是什么 / 不是什么

| 是什么 | 不是什么 |
| --- | --- |
| 面向中文读者的公开网站资源目录 | 代理、VPN、机场或访问绕过教程 |
| 用于发现、研究、导航和引用的公开数据集 | 代理销售、流量转售或灰产入口 |
| GitHub 上可以直接点击阅读的 Markdown 目录 | 只能下载后使用的 CSV 数据包 |
| 带分类、标签和 schema 的结构化数据 | 成人、赌博、盗版、恶意软件或钓鱼链接集合 |
| [ifanqiang.com](https://ifanqiang.com) 的公开数据源 | 政治动员或宗教宣传目录 |

## 数据概览

| 数据 | 数量 | 入口 |
| --- | ---: | --- |
| 网站 | 1507 | [sites/README.md](sites/README.md) |
| YouTube 频道 | 69 | [youtube/README.md](youtube/README.md) |
| 专题 | 30 | [topics/README.md](topics/README.md) |
| 网站分类 | 15 | [sites/README.md](sites/README.md) |
| YouTube 分类 | 8 | [youtube/README.md](youtube/README.md) |
| 全部导出链接 | 1576 | [data/all-links.json](data/all-links.json) |

公开导出规则：

- 网站：只导出 `status = 'active'` 且 `visible = true` 的条目。
- YouTube 频道：只导出 `status = 'active'` 且 `visible = true` 的条目。
- 已归档、隐藏、不安全或人工排除的条目不会进入公开 Markdown。

机器数据保留在：

- [data/sites.json](data/sites.json)
- [data/sites.csv](data/sites.csv)
- [data/youtube-channels.json](data/youtube-channels.json)
- [data/youtube-channels.csv](data/youtube-channels.csv)
- [data/all-links.json](data/all-links.json)
- [data/all-links.csv](data/all-links.csv)
- [data/urls.txt](data/urls.txt)
- [schema/site.schema.json](schema/site.schema.json)
- [schema/youtube-channel.schema.json](schema/youtube-channel.schema.json)

根目录兼容文件暂时保留：

- [sites.json](sites.json)
- [youtube-channels.json](youtube-channels.json)
- [categories.json](categories.json)

## 分类入口

### 网站

| 分类 | 数量 |
| --- | ---: |
| [中文新闻](sites/chinese-news.md) | 116 |
| [国际新闻](sites/international-news.md) | 100 |
| [视频与流媒体](sites/video-streaming.md) | 78 |
| [社交平台](sites/social-platforms.md) | 51 |
| [论坛社区](sites/forums-communities.md) | 254 |
| [博客与出版](sites/blogs-publishing.md) | 87 |
| [播客与音频](sites/podcasts-audio.md) | 65 |
| [搜索与发现](sites/search-discovery.md) | 57 |
| [百科与开放资料](sites/encyclopedia-open-data.md) | 84 |
| [学术研究](sites/academic-research.md) | 106 |
| [财经与数据](sites/finance-data.md) | 85 |
| [应用与下载](sites/apps-downloads.md) | 74 |
| [开发者资源](sites/developer-resources.md) | 142 |
| [生活出行](sites/life-travel.md) | 108 |
| [隐私安全](sites/privacy-security.md) | 100 |

### YouTube 频道

| 分类 | 数量 |
| --- | ---: |
| [新闻与公共议题](youtube/youtube-news-public-affairs.md) | 10 |
| [商业财经](youtube/youtube-business-finance.md) | 5 |
| [科技与数码](youtube/youtube-tech-digital.md) | 5 |
| [知识教育](youtube/youtube-knowledge-education.md) | 7 |
| [语言学习](youtube/youtube-language-learning.md) | 7 |
| [美食旅行](youtube/youtube-food-travel.md) | 10 |
| [影视娱乐](youtube/youtube-film-entertainment.md) | 11 |
| [香港与东南亚](youtube/youtube-hong-kong-southeast-asia.md) | 14 |

### 专题

专题页按具体用途组织资源，例如学术研究、开发者文档、安全资料、公共数据、中文新闻、播客、中文 YouTube 频道、财经数据和出行工具。

从 [topics/README.md](topics/README.md) 开始浏览。

## 数据示例

### 网站 JSON

```json
{
  "id": "bbc-com-zhongwen-simp",
  "type": "site",
  "name": "BBC News 中文",
  "description": "BBC 的中文新闻服务，覆盖国际、中国、科技、经济等话题。核心提供新闻报道、专题内容和原站更新入口。",
  "url": "https://www.bbc.com/zhongwen/simp",
  "category": "chinese-news",
  "categoryName": "中文新闻",
  "tags": ["新闻", "国际", "中文"],
  "language": "zh",
  "status": "active"
}
```

### YouTube 频道 JSON

```json
{
  "id": "xiaolin-youtube",
  "type": "youtube-channel",
  "name": "小Lin说",
  "description": "用故事化方式讲解商业公司、金融事件、经济周期、行业变化和消费市场逻辑。",
  "url": "https://www.youtube.com/channel/UCilwQlk62k1z7aUEZPOB6yw",
  "category": "youtube-business-finance",
  "categoryName": "商业财经",
  "tags": ["财经", "商业", "经济"],
  "status": "active"
}
```

## 如何使用

直接在 GitHub 上浏览：

- [网站分类目录](sites/README.md)
- [YouTube 频道目录](youtube/README.md)
- [专题目录](topics/README.md)

读取 JSON：

```js
import sites from "./data/sites.json" assert { type: "json" };

const academicResources = sites.filter((site) => site.category === "academic-research");
```

本地校验：

```bash
npm ci
npm run validate
```

从生产数据库重新导出：

```bash
DATABASE_URL="postgres://..." DATABASE_SSL=true npm run export:prod
npm run validate
```

生产数据库连接不会提交到仓库。

发布命名建议：

```text
2026-W26 公开网站资源数据集
```

发布说明模板见 [.github/RELEASE_TEMPLATE.md](.github/RELEASE_TEMPLATE.md)。

## 贡献

欢迎提交能提升目录公共价值、准确性、安全性和可维护性的建议。

好的资源推荐通常包括：

- 公开、官方或长期稳定的资源链接。
- 这个资源到底能帮用户做什么。
- 建议分类和标签。
- 为什么它不是垃圾站、误导链接或不安全链接。

本仓库不收录 VPN 销售、代理销售、成人内容、赌博、盗版、恶意软件、钓鱼、灰产服务、明显政治动员站点或宗教宣传站点。

完整规则见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可证

MIT。见 [LICENSE](LICENSE)。

## 相关链接

- 主站：[ifanqiang.com](https://ifanqiang.com)
- 网站 Markdown 目录：[sites/README.md](sites/README.md)
- YouTube Markdown 目录：[youtube/README.md](youtube/README.md)
- 专题 Markdown 目录：[topics/README.md](topics/README.md)
- 机器数据：[data/](data/)
