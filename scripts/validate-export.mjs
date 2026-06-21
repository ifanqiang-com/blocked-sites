import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function assertFile(relativePath) {
  if (!fs.existsSync(path.join(repositoryRoot, relativePath))) fail(`Missing file: ${relativePath}`);
}

function assertUnique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = key(item);
    if (seen.has(value)) fail(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function normalizeUrl(value) {
  return String(value || "").replace(/\/$/, "").toLowerCase();
}

function walkMarkdown(relativeDir) {
  const root = path.join(repositoryRoot, relativeDir);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { recursive: true })
    .filter((entry) => String(entry).endsWith(".md"))
    .map((entry) => path.join(relativeDir, String(entry)));
}

function assertMarkdownLinks(relativePath) {
  const content = fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
  const links = content.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g);
  for (const link of links) {
    const href = link[1];
    if (!href || href === "#") fail(`Invalid empty Markdown link in ${relativePath}`);
    if (/^(javascript|data):/i.test(href)) fail(`Unsafe Markdown link in ${relativePath}: ${href}`);
  }
}

const metadata = readJson("data/metadata.json");
const sites = readJson("data/sites.json");
const youtubeChannels = readJson("data/youtube-channels.json");
const allLinks = readJson("data/all-links.json");
const topics = readJson("content/topics.json");
const publicOverrides = readJson("content/public-overrides.json");

assertFile("README.md");
assertFile("sites/README.md");
assertFile("youtube/README.md");
assertFile("topics/README.md");
assertFile("sites.json");
assertFile("youtube-channels.json");
assertFile("categories.json");
assertFile("data/sites.csv");
assertFile("data/youtube-channels.csv");
assertFile("data/all-links.csv");
assertFile("data/urls.txt");

if (metadata.source !== "production-database") fail(`Unexpected metadata source: ${metadata.source}`);
if (metadata.counts.sites !== sites.length) fail("metadata site count does not match data/sites.json");
if (metadata.counts.youtubeChannels !== youtubeChannels.length) fail("metadata YouTube count does not match data/youtube-channels.json");
if (metadata.counts.allLinks !== allLinks.length) fail("metadata all-links count does not match data/all-links.json");
if (metadata.counts.topics !== topics.length) fail("metadata topic count does not match content/topics.json");
const excludedSiteIds = Object.keys(publicOverrides.excludedSiteIds || {});
const expectedExportedSites = Number(metadata.production?.sitesPublic || 0) - excludedSiteIds.length;
if (expectedExportedSites !== sites.length) {
  fail("production public site count minus public exclusions does not match exported sites");
}
if (metadata.production?.youtubePublic !== youtubeChannels.length) fail("production public YouTube count does not match exported YouTube channels");

assertUnique(sites, (site) => site.id, "site id");
assertUnique(youtubeChannels, (channel) => channel.id, "YouTube id");
assertUnique(sites, (site) => normalizeUrl(site.url), "site URL");
assertUnique(youtubeChannels, (channel) => normalizeUrl(channel.url), "YouTube URL");

for (const site of sites) {
  if (site.status !== "active" || site.visible === false) fail(`Non-public site exported: ${site.id}`);
  assertFile(`sites/items/${site.id}.md`);
}

for (const channel of youtubeChannels) {
  if (channel.status !== "active" || channel.visible === false) fail(`Non-public YouTube channel exported: ${channel.id}`);
  assertFile(`youtube/items/${channel.id}.md`);
}

for (const topic of topics) {
  assertFile(`topics/${topic.slug}.md`);
  const content = fs.readFileSync(path.join(repositoryRoot, "topics", `${topic.slug}.md`), "utf8");
  if (!content.includes("| 名称 | 简介 | 分类 | 标签 | 站内 |")) fail(`Topic has no item table: ${topic.slug}`);
  if (!/\]\(https?:\/\//.test(content)) fail(`Topic has no clickable external links: ${topic.slug}`);
}

const siteIds = new Set(sites.map((site) => site.id));
if (siteIds.has("kktv-me")) fail("kktv-me should not be exported as a public active site");
if (siteIds.has("xkb-com-au")) fail("xkb-com-au should not be exported as a public active site");

const peoplemedia = sites.find((site) => site.id === "peoplemedia-tw");
if (peoplemedia && peoplemedia.url !== "https://www.peoplenews.tw/") {
  fail(`peoplemedia-tw should use https://www.peoplenews.tw/, got ${peoplemedia.url}`);
}

const justpod = sites.find((site) => site.id === "justpodmedia-com");
if (justpod && justpod.url !== "https://www.justpod.com/") {
  fail(`justpodmedia-com should use https://www.justpod.com/, got ${justpod.url}`);
}

const markdownFiles = ["README.md", ...walkMarkdown("sites"), ...walkMarkdown("youtube"), ...walkMarkdown("topics"), ...walkMarkdown("data")];
for (const file of markdownFiles) assertMarkdownLinks(file);

console.log(
  JSON.stringify(
    {
      ok: true,
      sites: sites.length,
      youtubeChannels: youtubeChannels.length,
      topics: topics.length,
      markdownFiles: markdownFiles.length
    },
    null,
    2
  )
);
