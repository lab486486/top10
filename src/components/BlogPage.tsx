import { marked } from 'marked'
import { blogPosts, findPost, type BlogPost } from '../data/blog'

marked.setOptions({ gfm: true, breaks: true })

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function extractToc(body: string): { id: string; text: string }[] {
  const headings = [...body.matchAll(/^#{2,3}\s+(.+)$/gm)]
  return headings.map((m, i) => {
    const text = m[1].replace(/[*_`]/g, '').trim()
    const id = `section-${i + 1}`
    return { id, text }
  })
}

function injectHeadingIds(html: string, toc: { id: string; text: string }[]) {
  let i = 0
  return html.replace(/<(h[23])>([\s\S]*?)<\/\1>/gi, (_full, tag, inner) => {
    const id = toc[i]?.id ?? `section-${i + 1}`
    i += 1
    return `<${tag} id="${id}">${inner}</${tag}>`
  })
}

export function BlogList({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <section className="blog" id="blog">
      <div className="blog__head">
        <h2>블로그</h2>
        <p>사료 고르기 팁과 계급도 이야기를 모았습니다.</p>
      </div>
      {blogPosts.length === 0 ? (
        <p className="blog__empty">아직 게시글이 없습니다.</p>
      ) : (
        <ul className="blog__list">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <button type="button" className="blog__card" onClick={() => onOpen(post.slug)}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <strong>{post.title}</strong>
                {post.summary && <span>{post.summary}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function BlogArticle({
  post,
  onBack,
  onOpen,
}: {
  post: BlogPost
  onBack: () => void
  onOpen?: (slug: string) => void
}) {
  const toc = extractToc(post.body)
  const html = injectHeadingIds(marked.parse(post.body) as string, toc)
  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 4)

  return (
    <article className="blog-article" id="blog">
      <button type="button" className="blog-article__back" onClick={onBack}>
        ← 목록
      </button>
      <header className="blog-article__head">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <h1>{post.title}</h1>
        {post.summary && <p>{post.summary}</p>}
      </header>

      <div className="blog-article__layout">
        <div
          className="blog-article__body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <aside className="blog-article__aside" aria-label="글 안내">
          <div className="blog-article__aside-inner">
            {toc.length > 0 && (
              <div className="blog-aside-block">
                <strong className="blog-aside-block__title">목차</strong>
                <ol className="blog-aside-toc">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.text}</a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="blog-aside-block">
              <strong className="blog-aside-block__title">이 글</strong>
              <p className="blog-aside-meta">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              {post.summary && <p className="blog-aside-summary">{post.summary}</p>}
            </div>
            {others.length > 0 && (
              <div className="blog-aside-block">
                <strong className="blog-aside-block__title">다른 글</strong>
                <ul className="blog-aside-related">
                  {others.map((p) => (
                    <li key={p.slug}>
                      {onOpen ? (
                        <button
                          type="button"
                          className="blog-aside-related__btn"
                          onClick={() => onOpen(p.slug)}
                        >
                          {p.title}
                        </button>
                      ) : (
                        <a href={`/blog/${p.slug}`}>{p.title}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}

export function resolveBlogSlug(path: string): string | null {
  if (path === '/blog' || path === '/blog/') return null
  const m = path.match(/^\/blog\/([^/]+)\/?$/)
  return m ? decodeURIComponent(m[1]) : null
}

export { findPost }
