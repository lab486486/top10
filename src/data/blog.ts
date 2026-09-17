export type BlogPost = {
  slug: string
  title: string
  summary: string
  date: string
  draft: boolean
  thumbnail: string
  body: string
}

function parseFrontmatter(raw: string): { data: Record<string, string | boolean>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw.trim() }

  const data: Record<string, string | boolean> = {}
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
    const thumbnail = String(data.thumbnail ?? '') || firstBodyImage(body)
    return {
      slug: slugFromPath(path),
      title: String(data.title ?? slugFromPath(path)),
      summary: String(data.summary ?? ''),
      date: String(data.date ?? ''),
      draft: Boolean(data.draft),
      thumbnail,
      body,
    }
  })
  .filter((p) => !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export function findPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}
