# blocked-sites

这个仓库维护 [爱翻墙](https://ifanqiang.com) 当前公开收录的网址和 YouTube 中文频道导出数据。

导出时间：2026-06-17T21:40:24.725Z

## 数据概览

| 文件 | 数量 | 说明 |
| --- | ---: | --- |
| `sites.json` | 1509 | 当前网址导航条目，保留在仓库根目录，便于直接读取 |
| `youtube-channels.json` | 69 | 当前 YouTube 中文频道条目 |
| `categories.json` | 25 | 网址分类和 YouTube 分类 |
| `data/all-links.json` | 1578 | 网址和 YouTube 频道合并清单 |
| `data/sites.csv` | 1509 | CSV 格式网址清单 |
| `data/youtube-channels.csv` | 69 | CSV 格式 YouTube 频道清单 |
| `data/all-links.csv` | 1578 | CSV 格式合并清单 |
| `data/ifq-data.json` | 1578 | 带元数据、分类和完整条目的数据包 |
| `data/urls.txt` | 1509 | 纯网址列表 |
| `data/youtube-channel-urls.txt` | 69 | 纯 YouTube 频道 URL 列表 |

## 字段说明

`sites.json` 的每条记录包含：

- `id` / `uid`：稳定条目 ID
- `type`：固定为 `site`
- `name`、`description`、`url`
- `category`：机器可读分类 ID
- `categoryName`：中文分类名
- `tags`、`language`、`hasApp`、`status`、`featured`、`priority`、`addedAt`、`sourceUrl`

`youtube-channels.json` 的每条记录包含：

- `id` / `uid`：稳定条目 ID
- `type`：固定为 `youtube-channel`
- `name`、`description`、`url`
- `category`：机器可读分类 ID
- `categoryName`：中文分类名
- `tags`、`featured`、`addedAt`、`meta`

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
