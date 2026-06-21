import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repositoryRoot, "data");
const sitesDir = path.join(repositoryRoot, "sites");
const youtubeDir = path.join(repositoryRoot, "youtube");
const topicsDir = path.join(repositoryRoot, "topics");
const itemsDir = path.join(sitesDir, "items");
const youtubeItemsDir = path.join(youtubeDir, "items");
const contentDir = path.join(repositoryRoot, "content");
const siteUrl = "https://ifanqiang.com";

const databaseUrl = process.env.DATABASE_URL;
const databaseSsl = ["1", "true", "yes", "on"].includes(String(process.env.DATABASE_SSL || "").toLowerCase());

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Point it at the production Postgres database.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseSsl ? { rejectUnauthorized: false } : false
});

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

const DEFAULT_LIMIT = 12;
const FALLBACK_PRIORITY = 9999;
const DEFAULT_SITE_EXCLUDE_TAGS = ["VPN", "代理", "节点", "破解", "博彩", "赌博", "成人", "盗版"];
const DEFAULT_SITE_EXCLUDE_TEXT = ["vpn", "破解", "博彩", "赌博", "成人", "盗版"];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

function slugFallback(value, fallback) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}

function categoryId(name, type, index) {
  const known = type === "youtube" ? youtubeCategoryIds.get(name) : siteCategoryIds.get(name);
  return known || slugFallback(name, `${type}-category-${index + 1}`);
}

function dateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function normalizeUrl(value) {
  return String(value || "").replace(/\/$/, "").toLowerCase();
}

function assertUnique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) throw new Error(`Duplicate ${label}: ${value}`);
    seen.add(value);
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

function markdownText(value) {
  return String(value ?? "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mdEscape(value) {
  return markdownText(value).replace(/\\/g, "\\\\").replace(/`/g, "\\`");
}

function tableCell(value) {
  return mdEscape(value).replace(/\|/g, "\\|");
}

function mdLink(label, href) {
  return `[${tableCell(label)}](${href})`;
}

function tagText(tags) {
  return tags?.length ? tags.join("、") : "";
}

function languageName(language) {
  if (language === "zh") return "中文";
  if (language === "en") return "英文";
  return "多语言";
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(repositoryRoot, relativePath), content.endsWith("\n") ? content : `${content}\n`);
}

function writeJson(relativePath, value) {
  writeFile(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function csvEscape(value) {
  if (Array.isArray(value)) return csvEscape(value.join(" | "));
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) return `"${stringValue.replaceAll('"', '""')}"`;
  return stringValue;
}

function writeCsv(relativePath, headers, rows) {
  writeFile(
    relativePath,
    [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
    ].join("\n")
  );
}

async function tableExists(client, tableName) {
  const result = await client.query("SELECT to_regclass($1) AS name", [`public.${tableName}`]);
  return Boolean(result.rows[0]?.name);
}

async function columnExists(client, tableName, columnName) {
  const result = await client.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2`,
    [tableName, columnName]
  );
  return result.rowCount > 0;
}

async function loadProductionData() {
  const client = await pool.connect();
  try {
    const profileTableExists = await tableExists(client, "site_profile_materials");
    const profilePublishedAtExists = profileTableExists
      ? await columnExists(client, "site_profile_materials", "published_at")
      : false;

    const siteCategoriesResult = await client.query(
      "SELECT name, sort_order FROM site_categories WHERE visible = true ORDER BY sort_order, name"
    );
    const youtubeCategoriesResult = await client.query(
      "SELECT name, sort_order FROM youtube_categories WHERE visible = true ORDER BY sort_order, name"
    );

    const profileJoin = profileTableExists
      ? `LEFT JOIN site_profile_materials spm
           ON spm.site_id = ds.id
          AND spm.profile_status = 'published'`
      : "";
    const profileSelect = profileTableExists
      ? `spm.profile_draft AS profile,
         spm.can_do AS profile_can_do,
         spm.angle AS profile_angle,
         ${profilePublishedAtExists ? "spm.published_at" : "NULL"} AS profile_published_at`
      : `NULL::text AS profile,
         NULL::text AS profile_can_do,
         NULL::text AS profile_angle,
         NULL::timestamptz AS profile_published_at`;

    const sitesResult = await client.query(
      `SELECT ds.id, ds.name, ds.url, ds.category, ds.description, ds.tags,
              ds.language, ds.has_app, ds.status, ds.visible, ds.featured,
              ds.priority, ds.added_at, ds.source_url,
              ${profileSelect}
       FROM directory_sites ds
       ${profileJoin}
       WHERE ds.status = 'active'
         AND ds.visible = true
       ORDER BY ds.category, ds.priority, ds.featured DESC, ds.name`
    );

    const youtubeResult = await client.query(
      `SELECT id, name, url, category, description, tags, meta, status, visible,
              featured, priority, added_at
       FROM youtube_channels
       WHERE status = 'active'
         AND visible = true
       ORDER BY category, priority, featured DESC, name`
    );

    const productionCounts = {
      sitesTotal: Number((await client.query("SELECT count(*)::int AS count FROM directory_sites")).rows[0].count),
      sitesPublic: sitesResult.rowCount,
      youtubeTotal: Number((await client.query("SELECT count(*)::int AS count FROM youtube_channels")).rows[0].count),
      youtubePublic: youtubeResult.rowCount,
      profileTableAvailable: profileTableExists
    };

    return {
      siteCategories: siteCategoriesResult.rows.map((row, index) => ({
        id: categoryId(row.name, "site", index),
        name: row.name,
        sortOrder: row.sort_order
      })),
      youtubeCategories: youtubeCategoriesResult.rows.map((row, index) => ({
        id: categoryId(row.name, "youtube", index),
        name: row.name,
        sortOrder: row.sort_order
      })),
      sites: sitesResult.rows,
      youtubeChannels: youtubeResult.rows,
      productionCounts
    };
  } finally {
    client.release();
  }
}

function toSiteExport(row, siteCategoryByName) {
  return {
    uid: row.id,
    id: row.id,
    type: "site",
    name: row.name,
    description: row.description,
    url: row.url,
    category: siteCategoryByName.get(row.category)?.id || slugFallback(row.category, "site-category"),
    categoryName: row.category,
    tags: row.tags || [],
    language: row.language,
    hasApp: row.has_app,
    status: row.status,
    featured: row.featured,
    priority: row.priority,
    addedAt: dateOnly(row.added_at),
    sourceUrl: row.source_url,
    profile: row.profile || undefined,
    profileCanDo: row.profile_can_do || undefined,
    profileAngle: row.profile_angle || undefined,
    profilePublishedAt: dateOnly(row.profile_published_at)
  };
}

function toYoutubeExport(row, youtubeCategoryByName) {
  return {
    uid: row.id,
    id: row.id,
    type: "youtube-channel",
    name: row.name,
    description: row.description,
    url: row.url,
    category: youtubeCategoryByName.get(row.category)?.id || slugFallback(row.category, "youtube-category"),
    categoryName: row.category,
    tags: row.tags || [],
    featured: row.featured,
    priority: row.priority,
    addedAt: dateOnly(row.added_at),
    meta: row.meta || undefined,
    status: row.status,
    visible: row.visible
  };
}

function sourceRecordsFor(type, { sites, youtubeChannels, channels }) {
  if (type === "sites") {
    return sites.map((site) => ({
      id: site.id,
      name: site.name,
      description: site.description,
      category: site.categoryName,
      tags: site.tags || [],
      href: `${siteUrl}/sites/${site.id}`,
      externalUrl: site.url,
      matchUrl: site.url,
      featured: site.featured,
      priority: site.priority,
      sourceType: "sites"
    }));
  }

  if (type === "youtube") {
    return youtubeChannels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      category: channel.categoryName,
      tags: channel.tags || [],
      href: `${siteUrl}/youtube/${channel.id}`,
      externalUrl: channel.url,
      matchUrl: channel.url,
      featured: channel.featured,
      priority: channel.priority,
      sourceType: "youtube"
    }));
  }

  if (type === "channels") {
    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      category: channel.category,
      tags: channel.tags || [],
      href: channel.url,
      externalUrl: channel.url,
      matchUrl: channel.url,
      platform: channel.platform,
      featured: channel.featured,
      priority: channel.priority,
      sourceType: "channels"
    }));
  }

  return [];
}

function normalizedValues(values) {
  return values?.map((value) => String(value).toLocaleLowerCase("zh-Hans-CN")) ?? [];
}

function normalizedItemText(item) {
  return normalizedValues([
    item.name,
    item.description,
    item.category,
    item.matchUrl || "",
    ...(item.tags || [])
  ]).join(" ");
}

function matchesSource(item, source) {
  if (source.categories && !source.categories.includes(item.category)) return false;
  if (source.platforms && !item.platform) return false;
  if (source.platforms && !source.platforms.includes(item.platform || "")) return false;
  if (source.featuredOnly && !item.featured) return false;

  const itemTags = normalizedValues(item.tags || []);
  const tagsAny = normalizedValues(source.tagsAny);
  const tagsAll = normalizedValues(source.tagsAll);
  const excludeTagsAny = normalizedValues([
    ...(source.type === "sites" ? DEFAULT_SITE_EXCLUDE_TAGS : []),
    ...(source.excludeTagsAny || [])
  ]);

  if (tagsAny.length > 0 && !tagsAny.some((tag) => itemTags.includes(tag))) return false;
  if (tagsAll.length > 0 && !tagsAll.every((tag) => itemTags.includes(tag))) return false;
  if (excludeTagsAny.length > 0 && excludeTagsAny.some((tag) => itemTags.includes(tag))) return false;

  const itemText = normalizedItemText(item);
  const textAny = normalizedValues(source.textAny);
  const textAll = normalizedValues(source.textAll);
  const excludeTextAny = normalizedValues([
    ...(source.type === "sites" ? DEFAULT_SITE_EXCLUDE_TEXT : []),
    ...(source.excludeTextAny || [])
  ]);

  if (textAny.length > 0 && !textAny.some((text) => itemText.includes(text))) return false;
  if (textAll.length > 0 && !textAll.every((text) => itemText.includes(text))) return false;
  if (excludeTextAny.length > 0 && excludeTextAny.some((text) => itemText.includes(text))) return false;
  return true;
}

function dedupeItems(items) {
  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    const key = item.id || item.matchUrl || item.href;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

function sortResolvedItems(a, b) {
  if (Boolean(a.featured) !== Boolean(b.featured)) return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  const priorityA = typeof a.priority === "number" ? a.priority : FALLBACK_PRIORITY;
  const priorityB = typeof b.priority === "number" ? b.priority : FALLBACK_PRIORITY;
  if (priorityA !== priorityB) return priorityA - priorityB;
  return a.name.localeCompare(b.name, "zh-Hans-CN");
}

function resolveTopicItems(source, data) {
  const records = sourceRecordsFor(source.type, data);
  const limit = source.limit || DEFAULT_LIMIT;
  const selected = source.ids
    ? source.ids.map((id) => records.find((item) => item.id === id)).filter(Boolean)
    : records;
  const filtered = dedupeItems(selected.filter((item) => matchesSource(item, source)));
  const ordered = source.ids ? filtered : [...filtered].sort(sortResolvedItems);
  return ordered.slice(0, limit);
}

function cleanGeneratedDirectories() {
  for (const directory of [sitesDir, youtubeDir, topicsDir]) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  for (const directory of [dataDir, sitesDir, youtubeDir, topicsDir, itemsDir, youtubeItemsDir]) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function renderReadme({ generatedAt, categories, youtubeCategories, sites, youtubeChannels, topics, metadata }) {
  const categoryRows = categories
    .map((category) => {
      const count = sites.filter((site) => site.category === category.id).length;
      return `| ${mdLink(category.name, `sites/${category.id}.md`)} | ${count} |`;
    })
    .join("\n");
  const topicRows = topics
    .map((topic) => `| ${mdLink(topic.title, `topics/${topic.slug}.md`)} | ${tableCell(topic.description)} |`)
    .join("\n");
  const youtubeRows = youtubeCategories
    .map((category) => {
      const count = youtubeChannels.filter((channel) => channel.category === category.id).length;
      return `| ${mdLink(category.name, `youtube/${category.id}.md`)} | ${count} |`;
    })
    .join("\n");

  return `# blocked-sites

这个仓库维护 [爱翻墙](${siteUrl}) 当前公开收录的网址和 YouTube 中文频道。现在以 Markdown 为主：打开 GitHub 页面就能直接看分类、简介和链接，不需要下载 CSV。

仓库名沿用历史名称，但当前定位是公开网站资源目录；不提供代理/VPN，不写访问教程，也不声明每个目标在所有网络环境下都一定被阻断或可访问。

导出时间：${generatedAt}

## 快速入口

- [全部网址分类](sites/README.md)
- [YouTube 中文频道](youtube/README.md)
- [专题导航](topics/README.md)
- [机器数据](data/)

## 数据概览

| 类型 | 数量 |
| --- | ---: |
| 公开网站 | ${sites.length} |
| YouTube 中文频道 | ${youtubeChannels.length} |
| 网址分类 | ${categories.length} |
| YouTube 分类 | ${youtubeCategories.length} |
| 专题 | ${topics.length} |
| Markdown 文件 | ${metadata.counts.markdownFiles} |

## 网址分类

| 分类 | 数量 |
| --- | ---: |
${categoryRows}

## YouTube 分类

| 分类 | 数量 |
| --- | ---: |
${youtubeRows}

## 专题

| 专题 | 说明 |
| --- | --- |
${topicRows}

## 机器数据

JSON、CSV 和纯 URL 列表保留在 [data/](data/) 目录，供程序读取；人类阅读请优先使用上面的 Markdown 目录。

## 使用和贡献

这些数据来源于 ifanqiang.com 的公开导航条目。欢迎通过 Issues 或 Pull Requests 反馈失效链接、分类问题和新增建议。

## 不收录

- 成人、色情或擦边内容
- 赌博网站
- 暴力、极端主义或非法交易内容
- 暗网或深网类入口
- 明显欺诈、恶意软件或钓鱼网站

## License

MIT
`;
}

function renderSitesIndex(categories, sites) {
  const rows = categories
    .map((category) => `| ${mdLink(category.name, `${category.id}.md`)} | ${sites.filter((site) => site.category === category.id).length} |`)
    .join("\n");
  return `# 网址目录

按分类浏览爱翻墙公开收录的网站。每个分类页都可以直接点击官网链接；单个条目页包含简介和已发布介绍文案。

| 分类 | 数量 |
| --- | ---: |
${rows}
`;
}

function renderSiteCategory(category, sites) {
  const rows = sites
    .map((site) =>
      `| ${mdLink(site.name, site.url)} | ${mdLink("详情", `items/${site.id}.md`)} | ${tableCell(site.description)} | ${tableCell(tagText(site.tags))} | ${languageName(site.language)} |`
    )
    .join("\n");
  return `# ${category.name}

共 ${sites.length} 个网站。点击名称可直接访问官网。

| 网站 | 详情 | 简介 | 标签 | 语言 |
| --- | --- | --- | --- | --- |
${rows}
`;
}

function renderSiteItem(site) {
  const profile = site.profile
    ? `\n## 入口介绍\n\n${mdEscape(site.profile)}\n`
    : "";
  return `# ${site.name}

- 官网：${mdLink(site.url, site.url)}
- 爱翻墙详情：${mdLink(`${siteUrl}/sites/${site.id}`, `${siteUrl}/sites/${site.id}`)}
- 分类：${mdEscape(site.categoryName)}
- 标签：${mdEscape(tagText(site.tags) || "未标注")}
- 语言：${languageName(site.language)}
- 移动端：${site.hasApp ? "有 App 或移动端入口" : "未标注 App"}
- 收录日期：${site.addedAt || "未标注"}
- 原始链接：${site.sourceUrl ? mdLink(site.sourceUrl, site.sourceUrl) : "未标注"}

## 简介

${mdEscape(site.description)}
${profile}`;
}

function renderYoutubeIndex(categories, channels) {
  const rows = categories
    .map((category) => `| ${mdLink(category.name, `${category.id}.md`)} | ${channels.filter((channel) => channel.category === category.id).length} |`)
    .join("\n");
  return `# YouTube 中文频道

按分类浏览 YouTube 中文频道。点击频道名称可直接打开 YouTube。

| 分类 | 数量 |
| --- | ---: |
${rows}
`;
}

function renderYoutubeCategory(category, channels) {
  const rows = channels
    .map((channel) =>
      `| ${mdLink(channel.name, channel.url)} | ${mdLink("详情", `items/${channel.id}.md`)} | ${tableCell(channel.description)} | ${tableCell(tagText(channel.tags))} | ${tableCell(channel.meta || "")} |`
    )
    .join("\n");
  return `# ${category.name}

共 ${channels.length} 个频道。点击名称可直接访问 YouTube。

| 频道 | 详情 | 简介 | 标签 | 备注 |
| --- | --- | --- | --- | --- |
${rows}
`;
}

function renderYoutubeItem(channel) {
  return `# ${channel.name}

- YouTube：${mdLink(channel.url, channel.url)}
- 爱翻墙详情：${mdLink(`${siteUrl}/youtube/${channel.id}`, `${siteUrl}/youtube/${channel.id}`)}
- 分类：${mdEscape(channel.categoryName)}
- 标签：${mdEscape(tagText(channel.tags) || "未标注")}
- 备注：${mdEscape(channel.meta || "未标注")}
- 收录日期：${channel.addedAt || "未标注"}

## 简介

${mdEscape(channel.description)}
`;
}

function renderTopicsIndex(topics) {
  const rows = topics
    .map((topic) => `| ${mdLink(topic.title, `${topic.slug}.md`)} | ${tableCell(topic.description)} | ${topic.sections.length} |`)
    .join("\n");
  return `# 专题导航

这些专题来自 ifanqiang.com 当前 /topics 内容，并用最新导出的公开网站和 YouTube 频道重新解析条目。

| 专题 | 说明 | 分组 |
| --- | --- | ---: |
${rows}
`;
}

function renderTopic(topic, resolvedSections, topicBySlug) {
  const sections = resolvedSections
    .map(({ section, items }) => {
      const rows = items.length
        ? items
            .map((item) => {
              const detail = item.href?.startsWith(siteUrl) ? mdLink("爱翻墙", item.href) : "";
              return `| ${mdLink(item.name, item.externalUrl || item.href)} | ${tableCell(item.description)} | ${tableCell(item.category || "")} | ${tableCell(tagText(item.tags || []))} | ${detail} |`;
            })
            .join("\n")
        : "| 暂无匹配条目 | 这个分组正在整理中。 |  |  |  |";
      return `## ${section.title}

${mdEscape(section.description)}

| 名称 | 简介 | 分类 | 标签 | 站内 |
| --- | --- | --- | --- | --- |
${rows}`;
    })
    .join("\n\n");
  const faqs = topic.faqs?.length
    ? `\n## 常见问题\n\n${topic.faqs.map((faq) => `### ${faq.question}\n\n${mdEscape(faq.answer)}`).join("\n\n")}\n`
    : "";
  const related = topic.relatedTopics?.length
    ? `\n## 相关专题\n\n${topic.relatedTopics
        .map((slug) => topicBySlug.get(slug))
        .filter(Boolean)
        .map((relatedTopic) => `- ${mdLink(relatedTopic.title, `${relatedTopic.slug}.md`)}`)
        .join("\n")}\n`
    : "";
  return `# ${topic.title}

${mdEscape(topic.intro || topic.description)}

- 更新时间：${topic.updatedAt || "未标注"}
- 原站专题：${mdLink(`${siteUrl}/topics/${topic.slug}`, `${siteUrl}/topics/${topic.slug}`)}

${sections}
${faqs}${related}`;
}

function renderMachineDataReadme(metadata) {
  return `# 机器数据

这些文件保留给程序读取。人类浏览请使用仓库根目录、sites/、youtube/ 和 topics/ 下的 Markdown。

导出时间：${metadata.generatedAt}

| 文件 | 数量 | 说明 |
| --- | ---: | --- |
| sites.json | ${metadata.counts.sites} | 公开网站 JSON |
| youtube-channels.json | ${metadata.counts.youtubeChannels} | YouTube 中文频道 JSON |
| all-links.json | ${metadata.counts.allLinks} | 网站和 YouTube 合并 JSON |
| sites.csv | ${metadata.counts.sites} | 公开网站 CSV |
| youtube-channels.csv | ${metadata.counts.youtubeChannels} | YouTube 中文频道 CSV |
| all-links.csv | ${metadata.counts.allLinks} | 合并 CSV |
| urls.txt | ${metadata.counts.sites} | 纯网站 URL |
| youtube-channel-urls.txt | ${metadata.counts.youtubeChannels} | 纯 YouTube URL |
| all-urls.txt | ${metadata.counts.allLinks} | 全部 URL |
`;
}

async function main() {
  const topics = readJson("content/topics.json");
  const channels = readJson("content/channels.json");
  const publicOverrides = readJson("content/public-overrides.json");
  const generatedAt = new Date().toISOString();
  const production = await loadProductionData();

  const siteCategoryByName = new Map(production.siteCategories.map((category) => [category.name, category]));
  const youtubeCategoryByName = new Map(production.youtubeCategories.map((category) => [category.name, category]));
  const excludedSiteIds = new Set(Object.keys(publicOverrides.excludedSiteIds || {}));
  const siteUrlOverrides = publicOverrides.siteUrlOverrides || {};
  const sites = production.sites
    .filter((row) => !excludedSiteIds.has(row.id))
    .map((row) => {
      const site = toSiteExport(row, siteCategoryByName);
      const override = siteUrlOverrides[site.id];
      if (!override) return site;
      return {
        ...site,
        url: override.url || site.url,
        sourceUrl: override.sourceUrl || site.sourceUrl
      };
    });
  const youtubeChannels = production.youtubeChannels.map((row) => toYoutubeExport(row, youtubeCategoryByName));
  const allLinks = [...sites, ...youtubeChannels];
  const categories = [
    { uid: "sites", id: "sites", type: "group", name: "网址", parent: "", index: 0 },
    ...production.siteCategories.map((category, index) => ({
      uid: category.id,
      id: category.id,
      type: "site-category",
      name: category.name,
      parent: "sites",
      index
    })),
    { uid: "youtube", id: "youtube", type: "group", name: "YouTube 中文频道", parent: "", index: 1 },
    ...production.youtubeCategories.map((category, index) => ({
      uid: category.id,
      id: category.id,
      type: "youtube-category",
      name: category.name,
      parent: "youtube",
      index
    }))
  ];

  assertUnique(sites, (site) => site.id, "site id");
  assertUnique(youtubeChannels, (channel) => channel.id, "YouTube channel id");
  assertUnique(sites, (site) => normalizeUrl(site.url), "site URL");
  assertUnique(youtubeChannels, (channel) => normalizeUrl(channel.url), "YouTube channel URL");
  validateUrls(sites, "site");
  validateUrls(youtubeChannels, "YouTube channel");

  cleanGeneratedDirectories();

  for (const category of production.siteCategories) {
    const categorySites = sites.filter((site) => site.category === category.id);
    writeFile(`sites/${category.id}.md`, renderSiteCategory(category, categorySites));
  }
  for (const site of sites) {
    writeFile(`sites/items/${site.id}.md`, renderSiteItem(site));
  }
  writeFile("sites/README.md", renderSitesIndex(production.siteCategories, sites));

  for (const category of production.youtubeCategories) {
    const categoryChannels = youtubeChannels.filter((channel) => channel.category === category.id);
    writeFile(`youtube/${category.id}.md`, renderYoutubeCategory(category, categoryChannels));
  }
  for (const channel of youtubeChannels) {
    writeFile(`youtube/items/${channel.id}.md`, renderYoutubeItem(channel));
  }
  writeFile("youtube/README.md", renderYoutubeIndex(production.youtubeCategories, youtubeChannels));

  const topicBySlug = new Map(topics.map((topic) => [topic.slug, topic]));
  const topicData = { sites, youtubeChannels, channels };
  let topicItemCount = 0;
  for (const topic of topics) {
    const resolvedSections = topic.sections.map((section) => {
      const items = resolveTopicItems(section.source, topicData);
      topicItemCount += items.length;
      return { section, items };
    });
    writeFile(`topics/${topic.slug}.md`, renderTopic(topic, resolvedSections, topicBySlug));
  }
  writeFile("topics/README.md", renderTopicsIndex(topics));

  const markdownFiles =
    1 +
    1 +
    production.siteCategories.length +
    sites.length +
    1 +
    production.youtubeCategories.length +
    youtubeChannels.length +
    1 +
    topics.length +
    1;
  const metadata = {
    generatedAt,
    source: "production-database",
    siteUrl,
    production: production.productionCounts,
    publicOverrides: {
      excludedSiteIds: Object.keys(publicOverrides.excludedSiteIds || {}),
      siteUrlOverrideIds: Object.keys(publicOverrides.siteUrlOverrides || {})
    },
    counts: {
      sites: sites.length,
      youtubeChannels: youtubeChannels.length,
      categories: categories.length,
      allLinks: allLinks.length,
      topics: topics.length,
      topicResolvedItems: topicItemCount,
      sitesWithProfile: sites.filter((site) => Boolean(site.profile)).length,
      markdownFiles
    }
  };

  writeJson("sites.json", sites);
  writeJson("youtube-channels.json", youtubeChannels);
  writeJson("categories.json", categories);
  writeJson("data/sites.json", sites);
  writeJson("data/youtube-channels.json", youtubeChannels);
  writeJson("data/all-links.json", allLinks);
  writeJson("data/ifq-data.json", {
    ...metadata,
    categories,
    sites,
    youtubeChannels,
    topics
  });
  writeJson("data/metadata.json", metadata);
  writeFile("data/README.md", renderMachineDataReadme(metadata));

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
    sites
  );
  writeCsv(
    "data/youtube-channels.csv",
    ["id", "type", "name", "url", "category", "categoryName", "description", "tags", "featured", "priority", "addedAt", "meta"],
    youtubeChannels
  );
  writeCsv(
    "data/all-links.csv",
    ["id", "type", "name", "url", "category", "categoryName", "description", "tags", "featured", "addedAt"],
    allLinks
  );
  writeFile("data/urls.txt", sites.map((site) => site.url).join("\n"));
  writeFile("data/youtube-channel-urls.txt", youtubeChannels.map((channel) => channel.url).join("\n"));
  writeFile("data/all-urls.txt", allLinks.map((item) => item.url).join("\n"));

  writeFile(
    "README.md",
    renderReadme({
      generatedAt,
      categories: production.siteCategories,
      youtubeCategories: production.youtubeCategories,
      sites,
      youtubeChannels,
      topics,
      metadata
    })
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        generatedAt,
        sites: sites.length,
        youtubeChannels: youtubeChannels.length,
        topics: topics.length,
        markdownFiles
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
