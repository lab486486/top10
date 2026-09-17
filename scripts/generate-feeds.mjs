#!/usr/bin/env node
/**
 * Build-time RSS 2.0 + sitemap.xml for Naver Search Advisor.
 * Output: public/rss, public/sitemap.xml, public/robots.txt
 *
 * Naver checks:
 * - Valid RSS 2.0 XML (not SPA HTML)
 * - ≥1 item with full body in <description>
 * - All URLs same domain as registered site (petfood.pe.kr)
 * - Fast response (static files)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const blogDir = join(root, 'content', 'blog')
const publicDir = join(root, 'public')

export const SITE = {
  origin: 'https://petfood.pe.kr',
  title: '펫푸드 · 사료 계급도',
  description:
    '강아지·고양이 사료를 공개 스코어 서열로 한눈에 비교하는 펫푸드 계급도와 블로그입니다.',
  language: 'ko',
}

marked.setOptions({ gfm: true, breaks: true })

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw.trim() }

  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (value === 'true' || value === 'false') data[key] = value === 'true'
    else data[key] = value
  }
  return { data, body: match[2].trim() }
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(html) {
  return `<![CDATA[${String(html).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function absolutizeHtml(html) {
  return String(html)
    .replace(
      /(src|href)=(["'])\/(?!\/)/gi,
      (_, attr, q) => `${attr}=${q}${SITE.origin}/`,
    )
    .replace(
      /(src|href)=(["'])\.\//gi,
      (_, attr, q) => `${attr}=${q}${SITE.origin}/`,
    )
}

function toRfc822(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return new Date().toUTCString()
  return d.toUTCString()
}

function toW3cDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

function loadPosts() {
  mkdirSync(blogDir, { recursive: true })
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'))
  return files
    .map((file) => {
      const raw = readFileSync(join(blogDir, file), 'utf8')
      const { data, body } = parseFrontmatter(raw)
      const slug = file.replace(/\.md$/, '')
      return {
        slug,
        title: String(data.title ?? slug),
        summary: String(data.summary ?? ''),
        date: String(data.date ?? ''),
        draft: Boolean(data.draft),
        body,
      }
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

function buildRss(posts) {
  const lastBuild = toRfc822(posts[0]?.date || new Date().toISOString())
  const items = posts
    .map((post) => {
      const url = `${SITE.origin}/blog/${post.slug}`
      const html = absolutizeHtml(marked.parse(post.body))
      const description = post.summary
        ? `<p>${escapeXml(post.summary)}</p>${html}`
        : html
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${cdata(description)}</description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.origin)}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <docs>https://blogs.law.harvard.edu/tech/rss</docs>
${items}
  </channel>
</rss>
`
}

function buildSitemap(posts) {
  const now = new Date().toISOString()
  const urls = [
    { loc: `${SITE.origin}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' },
    {
      loc: `${SITE.origin}/blog`,
      lastmod: posts[0] ? toW3cDate(posts[0].date) : now,
      changefreq: 'daily',
      priority: '0.9',
    },
    ...posts.map((post) => ({
      loc: `${SITE.origin}/blog/${post.slug}`,
      lastmod: toW3cDate(post.date),
      changefreq: 'weekly',
      priority: '0.8',
    })),
  ]

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`
}

function main() {
  const posts = loadPosts()
  if (posts.length === 0) {
    console.error('generate-feeds: no published blog posts — Naver requires ≥1 RSS item')
    process.exit(1)
  }

  mkdirSync(publicDir, { recursive: true })
  writeFileSync(join(publicDir, 'rss'), buildRss(posts), 'utf8')
  writeFileSync(join(publicDir, 'sitemap.xml'), buildSitemap(posts), 'utf8')
  writeFileSync(join(publicDir, 'robots.txt'), buildRobots(), 'utf8')
  console.log(
    `generate-feeds: ${posts.length} post(s) → public/rss, public/sitemap.xml, public/robots.txt`,
  )
}

main()
