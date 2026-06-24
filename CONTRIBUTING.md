# Contributing

Thanks for helping improve Chinese Open Web Directory. The goal is a useful, public, long-lived directory of open web resources for Chinese-speaking users.

## What We Accept

Good additions are usually:

- Official websites, public documentation, public databases, media sources, research portals, developer tools, AI tools, software resources, communities, podcasts, or everyday utilities.
- Useful to Chinese-speaking readers, either because the resource is in Chinese or because it is broadly useful and reasonably accessible to Chinese readers.
- Publicly reachable from a normal browser.
- Stable enough to be worth bookmarking.
- Clear about what the user can actually do there.

Each submission should include:

- Resource name.
- Official URL.
- Suggested category.
- Short description of what the resource helps users do.
- Tags.
- Language.
- Reason it belongs in this directory.

## What We Do Not Accept

Do not submit:

- VPN, airport, proxy, traffic resale, or bypass-service sales pages.
- Adult, pornographic, gambling, piracy, warez, cracked-software, or gray-market services.
- Malware, phishing, scam, fake login, deceptive download, or unsafe links.
- Dark-web or deep-web gateway pages.
- Obvious political mobilization sites.
- Religious propaganda sites.
- SEO spam, affiliate-only pages, link farms, or low-effort scraped directories.
- Short-lived campaign pages that are unlikely to remain useful.

## Issue Types

Use the issue templates when possible:

- Recommend a public resource.
- Report a broken or unsafe link.
- Suggest a category improvement.

## Pull Requests

For data changes:

1. Keep the change focused.
2. Explain what the site does in plain language.
3. Use an existing category unless a new category is clearly needed.
4. Run validation before opening the pull request.

```bash
npm ci
npm run validate
```

## Data Source

The published dataset is generated from the production database behind [ifanqiang.com](https://ifanqiang.com). Public exports include active and visible resources only. Archived, hidden, unsafe, or manually excluded records should not appear in Markdown pages or machine data.
