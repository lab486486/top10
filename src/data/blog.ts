export type BlogPost = {
  slug: string
  title: string
  summary: string
  date: string
  draft: boolean
  thumbnail: string
  tags: string[]
  permalink: string
  body: string
}

function parseFrontmatter(raw: string): {
  data: Record<string, string | boolean | string[]>
  body: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw.trim() }

  const data: Record<string, string | boolean | string[]> = {}
  const lines = match[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()

    // YAML list: tags:\n  - a\n  - b  OR tags: [a, b]
    if (value === '' || value === '|' || value === '>') {
      const list: string[] = []
      let j = i + 1
      while (j < lines.length && /^\s+-\s+/.test(lines[j])) {
        list.push(lines[j].replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim())
        j += 1
      }
      if (list.length) {
        data[key] = list
        i = j - 1
        continue
      }
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
      continue
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (value === 'true' || value === 'false') {
      data[key] = value === 'true'
    } else {
      data[key] = value
    }
  }

  return { data, body: match[2].trim() }
}

function firstBodyImage(body: string): string {
  const md = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/)
  if (md?.[1]) return md[1]
  const html = body.match(/<img[^>]+src=["']([^"']+)["']/i)
  return html?.[1] ?? ''
}

function asTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,#]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

const modules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function slugFromPath(path: string) {
  const file = path.split('/').pop() ?? path
  return file.replace(/\.md$/, '')
}

export const blogPosts: BlogPost[] = Object.entries(modules)
  .map(([path, raw]) => {
    const { data, body } = parseFrontmatter(raw)
    const fileSlug = slugFromPath(path)
    const permalink = String(data.permalink ?? '').replace(/^\/+|\/+$/g, '')
    const thumbnail =
      String(data.thumbnail ?? data.cover_image ?? data.cover ?? '') || firstBodyImage(body)
    return {
      slug: permalink || fileSlug,
      title: String(data.title ?? fileSlug),
      summary: String(data.summary ?? data.description ?? ''),
      date: String(data.date ?? ''),
      draft: Boolean(data.draft),
      thumbnail,
      tags: asTags(data.tags),
      permalink,
      body,
    }
  })
  .filter((p) => !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function findPost(slug: string) {
  const key = decodeURIComponent(slug).replace(/^\/+|\/+$/g, '')
  return (
    blogPosts.find((p) => p.slug === key) ||
    blogPosts.find((p) => p.permalink === key) ||
    blogPosts.find((p) => p.slug.endsWith('/' + key))
  )
}
