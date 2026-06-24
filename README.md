# Chinese Open Web Directory

![Sites](https://img.shields.io/badge/sites-1507-2ea44f)
![YouTube channels](https://img.shields.io/badge/youtube%20channels-69-red)
![Topics](https://img.shields.io/badge/topics-30-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Chinese-friendly open web resources directory data for news, academic research, developer tools, AI tools, open data, communities, media, podcasts, and everyday utilities.

This dataset powers [ifanqiang.com](https://ifanqiang.com), a Chinese-language navigation directory for public web resources.

This project is:

- A public website resources dataset for Chinese readers.
- A direct Markdown directory you can browse on GitHub without downloading CSV files.
- A structured source for news, academic research, AI tools, developer resources, open data, communities, media, podcasts, and practical utilities.

This project is not:

- A VPN, proxy, airport, or bypass tutorial.
- A collection of gray-market links.
- A claim that every listed website is blocked, unblocked, endorsed, or reachable from every network.

Last generated from production data: `2026-06-21T23:56:17.348Z`

## Project Intro

Chinese Open Web Directory keeps a public, readable, and machine-friendly directory of useful web resources for Chinese-speaking users. The repository focuses on durable, public, legitimate entry points: official websites, media sources, research databases, developer documentation, open data portals, communities, software resources, and YouTube channels.

The GitHub repository is designed to be readable first. The Markdown pages under [sites/](sites/), [youtube/](youtube/), and [topics/](topics/) are the primary interface. JSON, CSV, and plain URL exports remain available under [data/](data/) for developers and automation.

## What This Is / Is Not

| This is | This is not |
| --- | --- |
| A Chinese-friendly open web resources directory | A proxy, VPN, or circumvention guide |
| A public dataset for discovery, research, and navigation | A sales list for VPNs, airports, or traffic resale |
| A Markdown-first GitHub directory with clickable links | A CSV-only data dump |
| A structured dataset with categories, tags, and schemas | A gray-market, adult, gambling, piracy, or unsafe-link collection |
| A source dataset for [ifanqiang.com](https://ifanqiang.com) | A political mobilization or religious promotion directory |

## Dataset Overview

| Dataset | Count | Entry point |
| --- | ---: | --- |
| Websites | 1507 | [sites/README.md](sites/README.md) |
| YouTube channels | 69 | [youtube/README.md](youtube/README.md) |
| Topics | 30 | [topics/README.md](topics/README.md) |
| Website categories | 15 | [sites/README.md](sites/README.md) |
| YouTube categories | 8 | [youtube/README.md](youtube/README.md) |
| Total exported links | 1576 | [data/all-links.json](data/all-links.json) |

Production export rules:

- Websites: `status = 'active'` and `visible = true`.
- YouTube channels: `status = 'active'` and `visible = true`.
- Archived, hidden, unsafe, or manually excluded entries are not exported to public Markdown.

Machine-readable files:

- [data/sites.json](data/sites.json)
- [data/sites.csv](data/sites.csv)
- [data/youtube-channels.json](data/youtube-channels.json)
- [data/youtube-channels.csv](data/youtube-channels.csv)
- [data/all-links.json](data/all-links.json)
- [data/all-links.csv](data/all-links.csv)
- [data/urls.txt](data/urls.txt)
- [schema/site.schema.json](schema/site.schema.json)

Compatibility files remain at the repository root for now:

- [sites.json](sites.json)
- [youtube-channels.json](youtube-channels.json)
- [categories.json](categories.json)

## Categories

### Websites

| Category | Count |
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

### YouTube Channels

| Category | Count |
| --- | ---: |
| [新闻与公共议题](youtube/youtube-news-public-affairs.md) | 10 |
| [商业财经](youtube/youtube-business-finance.md) | 5 |
| [科技与数码](youtube/youtube-tech-digital.md) | 5 |
| [知识教育](youtube/youtube-knowledge-education.md) | 7 |
| [语言学习](youtube/youtube-language-learning.md) | 7 |
| [美食旅行](youtube/youtube-food-travel.md) | 10 |
| [影视娱乐](youtube/youtube-film-entertainment.md) | 11 |
| [香港与东南亚](youtube/youtube-hong-kong-southeast-asia.md) | 14 |

### Topic Pages

The topic pages group resources around concrete use cases, such as academic research, developer documentation, cybersecurity references, public data, Chinese news, podcasts, YouTube channels, finance data, and travel tools.

Start from [topics/README.md](topics/README.md).

## Example Records

### Website JSON

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

### YouTube Channel JSON

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

## How To Use The Data

Browse directly on GitHub:

- [All website categories](sites/README.md)
- [All YouTube categories](youtube/README.md)
- [All topic pages](topics/README.md)

Use the JSON export:

```js
import sites from "./data/sites.json" assert { type: "json" };

const academicResources = sites.filter((site) => site.category === "academic-research");
```

Validate the repository:

```bash
npm ci
npm run validate
```

Regenerate from production data:

```bash
DATABASE_URL="postgres://..." DATABASE_SSL=true npm run export:prod
npm run validate
```

Production credentials are never committed to this repository.

Release naming convention:

```text
2026-W26 Public Web Resources Dataset
```

Use [.github/RELEASE_TEMPLATE.md](.github/RELEASE_TEMPLATE.md) for release notes.

## Contributing

Contributions are welcome when they improve the public value, accuracy, safety, or structure of the directory.

Good submissions usually include:

- A public, official, or long-lived resource link.
- A clear explanation of what the resource helps users do.
- A suggested category and useful tags.
- Evidence that the link is not unsafe, spammy, or misleading.

This repository does not accept VPN sales, proxy sales, adult content, gambling, piracy, malware, phishing, gray-market services, obvious political mobilization sites, or religious propaganda sites.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution rules.

## License

MIT. See [LICENSE](LICENSE).

## Related Links

- Main website: [ifanqiang.com](https://ifanqiang.com)
- Markdown website directory: [sites/README.md](sites/README.md)
- Markdown YouTube directory: [youtube/README.md](youtube/README.md)
- Markdown topic directory: [topics/README.md](topics/README.md)
- Machine data: [data/](data/)
