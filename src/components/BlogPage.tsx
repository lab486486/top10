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

export function BlogList({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <section className="blog" id="blog">
      <div className="blog__head">
        <h2>블로그</h2>
        <p>사료 고르기 팁과 계급도 이야기를 모았습니다.</p>
      </div>
      {blogPosts.length === 0 ? (
        <p className="blog__empty">
          아직 게시글이 없습니다. <code>/admin</code>에서 Decap CMS로 글을 추가하세요.
        </p>
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
}: {
  post: BlogPost
  onBack: () => void
}) {
  const html = marked.parse(post.body) as string

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
      <div
        className="blog-article__body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  )
}

export function resolveBlogSlug(path: string): string | null {
  if (path === '/blog' || path === '/blog/') return null
  const m = path.match(/^\/blog\/([^/]+)\/?$/)
  return m ? decodeURIComponent(m[1]) : null
}

export { findPost }
