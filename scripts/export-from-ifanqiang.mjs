import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");
const sourceRoot = path.resolve(process.argv[2] || path.join(repositoryRoot, "..", "ifanqiang"));
const dataDir = path.join(repositoryRoot, "data");

const siteCategoryIds = new Map([
  ["中文新闻", "chinese-news"],
  ["国际新闻", "international-news"],
  ["视频与流媒体", "video-streaming"],
  ["社交平台", "social-platforms"],
  ["论坛社区", "forums-communities"],
  ["博客与出版", "blogs-publishing"],
  ["播客与音频", "podcasts-audio"],
  ["搜索与发现", "search-discovery"],
  ["百科与开放资料", "encyclopedia-open-data"],
  ["学术研究", "academic-research"],
  ["财经与数据", "finance-data"],
  ["应用与下载", "apps-downloads"],
  ["开发者资源", "developer-resources"],
  ["生活出行", "life-travel"],
  ["隐私安全", "privacy-security"]
]);

const youtubeCategoryIds = new Map([
  ["新闻与公共议题", "youtube-news-public-affairs"],
  ["商业财经", "youtube-business-finance"],
  ["科技与数码", "youtube-tech-digital"],
  ["知识教育", "youtube-knowledge-education"],
  ["语言学习", "youtube-language-learning"],
  ["美食旅行", "youtube-food-travel"],
  ["影视娱乐", "youtube-film-entertainment"],
  ["香港与东南亚", "youtube-hong-kong-southeast-asia"]
]);

function sourceFile(relativePath) {
  return pathToFileURL(path.join(sourceRoot, relativePath)).href;
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repositoryRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function csvEscape(value) {
  if (Array.isArray(value)) {
    return csvEscape(value.join(" | "));
  }

  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function writeCsv(relativePath, headers, rows) {
  const output = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");

  fs.writeFileSync(path.join(repositoryRoot, relativePath), `${output}\n`);
}

function assertUnique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
}

function assertKnownCategories(items, categoryIds, label) {
  const unknown = [...new Set(items.map((item) => item.category).filter((category) => !categoryIds.has(category)))];
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label} categories: ${unknown.join(", ")}`);
  }
}

function validateUrls(items, label) {
  for (const item of items) {
    try {
      new URL(item.url);
    } catch {
      throw new Error(`Invalid ${label} URL for ${item.id}: ${item.url}`);
    }
  }
}

function toSiteExport(site) {
  const categoryId = siteCategoryIds.get(site.category);
  return {
    uid: site.id,
    id: site.id,
    type: "site",
    name: site.name,
    description: site.description,
    url: site.url,
    category: categoryId,
    categoryName: site.category,
    tags: site.tags,
    language: site.language,
    hasApp: site.hasApp,
    status: site.status,
    featured: site.featured,
    priority: site.priority,
    addedAt: site.addedAt,
    sourceUrl: site.sourceUrl
  };
}

function toYoutubeExport(channel) {
  const categoryId = youtubeCategoryIds.get(channel.category);
  return {
    uid: channel.id,
    id: channel.id,
    type: "youtube-channel",
    name: channel.name,
    description: channel.description,
    url: channel.url,
    category: categoryId,
    categoryName: channel.category,
    tags: channel.tags,
    featured: channel.featured,
    addedAt: channel.addedAt,
    meta: channel.meta
  };
}

function renderReadme({ generatedAt, siteCount, youtubeCount, categoryCount, allCount }) {
  return `# blocked-sites

这个仓库维护 [爱翻墙](https://ifanqiang.com) 当前公开收录的网址和 YouTube 中文频道导出数据。

导出时间：${generatedAt}

## 数据概览

| 文件 | 数量 | 说明 |
| --- | ---: | --- |
| \`sites.json\` | ${siteCount} | 当前网址导航条目，保留在仓库根目录，便于直接读取 |
| \`youtube-channels.json\` | ${youtubeCount} | 当前 YouTube 中文频道条目 |
| \`categories.json\` | ${categoryCount} | 网址分类和 YouTube 分类 |
| \`data/all-links.json\` | ${allCount} | 网址和 YouTube 频道合并清单 |
| \`data/sites.csv\` | ${siteCount} | CSV 格式网址清单 |
| \`data/youtube-channels.csv\` | ${youtubeCount} | CSV 格式 YouTube 频道清单 |
| \`data/all-links.csv\` | ${allCount} | CSV 格式合并清单 |
| \`data/ifq-data.json\` | ${allCount} | 带元数据、分类和完整条目的数据包 |
| \`data/urls.txt\` | ${siteCount} | 纯网址列表 |
| \`data/youtube-channel-urls.txt\` | ${youtubeCount} | 纯 YouTube 频道 URL 列表 |

## 字段说明

\`sites.json\` 的每条记录包含：

- \`id\` / \`uid\`：稳定条目 ID
- \`type\`：固定为 \`site\`
- \`name\`、\`description\`、\`url\`
- \`category\`：机器可读分类 ID
- \`categoryName\`：中文分类名
- \`tags\`、\`language\`、\`hasApp\`、\`status\`、\`featured\`、\`priority\`、\`addedAt\`、\`sourceUrl\`

\`youtube-channels.json\` 的每条记录包含：

- \`id\` / \`uid\`：稳定条目 ID
- \`type\`：固定为 \`youtube-channel\`
- \`name\`、\`description\`、\`url\`
- \`category\`：机器可读分类 ID
- \`categoryName\`：中文分类名
- \`tags\`、\`featured\`、\`addedAt\`、\`meta\`

## 使用和贡献

这些数据来源于 ifanqiang.com 的公开导航条目。仓库名沿用历史名称，但本导出不声明每个目标在所有网络环境下都一定被阻断或可访问。

欢迎通过 Issues 或 Pull Requests 反馈失效链接、分类问题和新增建议。这个列表不能帮助用户跨越 GFW，网络访问方式需要自行解决。

## 不收录

提交前请注意，这个列表不收录：

- 成人、色情或擦边内容
- 赌博网站
- 暴力、极端主义或非法交易内容
- 暗网或深网类入口
- 明显欺诈、恶意软件或钓鱼网站

## License

MIT
`;
}

const [{ sites }, { youtubeChannels, youtubeChannelCategories }, { siteCategories }, { siteConfig }] =
  await Promise.all([
    import(sourceFile("src/data/sites.ts")),
    import(sourceFile("src/data/youtubeChannels.ts")),
    import(sourceFile("src/data/categories.ts")),
    import(sourceFile("src/config/site.ts"))
  ]);

assertKnownCategories(sites, siteCategoryIds, "site");
assertKnownCategories(youtubeChannels, youtubeCategoryIds, "YouTube");
assertUnique(sites, (site) => site.id, "site id");
assertUnique(youtubeChannels, (channel) => channel.id, "YouTube channel id");
assertUnique(sites, (site) => site.url.replace(/\/$/, "").toLowerCase(), "site URL");
assertUnique(youtubeChannels, (channel) => channel.url.replace(/\/$/, "").toLowerCase(), "YouTube channel URL");
validateUrls(sites, "site");
validateUrls(youtubeChannels, "YouTube channel");

fs.mkdirSync(dataDir, { recursive: true });

const generatedAt = new Date().toISOString();
const exportedSites = sites.map(toSiteExport);
const exportedYoutubeChannels = youtubeChannels.map(toYoutubeExport);
const allLinks = [...exportedSites, ...exportedYoutubeChannels];
const categories = [
  {
    uid: "sites",
    id: "sites",
    type: "group",
    name: "网址",
    parent: "",
    index: 0
  },
  ...siteCategories.map((name, index) => ({
    uid: siteCategoryIds.get(name),
    id: siteCategoryIds.get(name),
    type: "site-category",
    name,
    parent: "sites",
    index
  })),
  {
    uid: "youtube",
    id: "youtube",
    type: "group",
    name: "YouTube 中文频道",
    parent: "",
    index: 1
  },
  ...youtubeChannelCategories.map((name, index) => ({
    uid: youtubeCategoryIds.get(name),
    id: youtubeCategoryIds.get(name),
    type: "youtube-category",
    name,
    parent: "youtube",
    index
  }))
];

const metadata = {
  generatedAt,
  source: {
    name: siteConfig.name,
    title: siteConfig.title,
    url: siteConfig.url,
    email: siteConfig.email
  },
  counts: {
    sites: exportedSites.length,
    youtubeChannels: exportedYoutubeChannels.length,
    categories: categories.length,
    allLinks: allLinks.length
  }
};

writeJson("sites.json", exportedSites);
writeJson("youtube-channels.json", exportedYoutubeChannels);
writeJson("categories.json", categories);
writeJson("data/sites.json", exportedSites);
writeJson("data/youtube-channels.json", exportedYoutubeChannels);
writeJson("data/all-links.json", allLinks);
writeJson("data/ifq-data.json", {
  ...metadata,
  categories,
  sites: exportedSites,
  youtubeChannels: exportedYoutubeChannels
});
writeJson("data/metadata.json", metadata);

writeCsv(
  "data/sites.csv",
  [
    "id",
    "type",
    "name",
    "url",
    "category",
    "categoryName",
    "description",
    "tags",
    "language",
    "hasApp",
    "status",
    "featured",
    "priority",
    "addedAt",
    "sourceUrl"
  ],
  exportedSites
);
writeCsv(
  "data/youtube-channels.csv",
  ["id", "type", "name", "url", "category", "categoryName", "description", "tags", "featured", "addedAt", "meta"],
  exportedYoutubeChannels
);
writeCsv(
  "data/all-links.csv",
  ["id", "type", "name", "url", "category", "categoryName", "description", "tags", "featured", "addedAt"],
  allLinks
);

fs.writeFileSync(path.join(dataDir, "urls.txt"), `${exportedSites.map((site) => site.url).join("\n")}\n`);
fs.writeFileSync(
  path.join(dataDir, "youtube-channel-urls.txt"),
  `${exportedYoutubeChannels.map((channel) => channel.url).join("\n")}\n`
);
fs.writeFileSync(path.join(dataDir, "all-urls.txt"), `${allLinks.map((item) => item.url).join("\n")}\n`);

fs.writeFileSync(
  path.join(repositoryRoot, "README.md"),
  renderReadme({
    generatedAt,
    siteCount: exportedSites.length,
    youtubeCount: exportedYoutubeChannels.length,
    categoryCount: categories.length,
    allCount: allLinks.length
  })
);

console.log(`Exported ${exportedSites.length} sites and ${exportedYoutubeChannels.length} YouTube channels.`);
