import { useEffect, useMemo, useState } from 'react'
import { type Species } from './data/products'
import {
  adaptCopyForSpecies,
  getClassTiers,
  getLadderSituations,
  LADDER_COPYRIGHT,
  LADDER_DISCLAIMER_LINES,
  LADDER_ONE_LINER,
  resolveBrandSpec,
  type TierBrand,
} from './data/ladder'
import { GRADE_CONTROVERSY_NOTE } from './data/score'
import heroDog from './assets/hero-dog.png'
import heroCat from './assets/hero-cat.png'
import { PetfoodMark } from './components/PetfoodMark'
import { resolveOrigin } from './data/origins'
import { BlogArticle, BlogList, findPost, resolveBlogSlug } from './components/BlogPage'
import './App.css'

function readPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

export default function App() {
  const [species, setSpecies] = useState<Species>('dog')
  const [navSpecies, setNavSpecies] = useState<Species | null>(null)
  const [methodOpen, setMethodOpen] = useState(false)
  const [path, setPath] = useState(readPath)
  const [scrollToGrades, setScrollToGrades] = useState(false)

  const classTiers = useMemo(() => getClassTiers(species), [species])
  const brandCount = useMemo(
    () => classTiers.reduce((n, t) => n + t.brands.length, 0),
    [classTiers],
  )
  const situations = useMemo(() => getLadderSituations(species), [species])

  const speciesLabel = species === 'dog' ? '강아지' : '고양이'
  const blogSlug = path.startsWith('/blog') ? resolveBlogSlug(path) : null
  const isBlog = path === '/blog' || Boolean(blogSlug)
  const activePost = blogSlug ? findPost(blogSlug) : undefined
  const navIdle = !isBlog && navSpecies === null

  const navigate = (to: string) => {
    const next = to.replace(/\/+$/, '') || '/'
    if (next === path) return
    window.history.pushState({}, '', next)
    setPath(next)
  }

  useEffect(() => {
    const onPop = () => setPath(readPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (!methodOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMethodOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [methodOpen])

  useEffect(() => {
    if (!scrollToGrades || isBlog) return
    setScrollToGrades(false)
    const toc = document.getElementById('grade-toc')
    const topbar = document.querySelector('.topbar')
    if (!toc) return
    const topbarH = topbar instanceof HTMLElement ? topbar.offsetHeight : 58
    const top = toc.getBoundingClientRect().top + window.scrollY - topbarH
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }, [scrollToGrades, species, isBlog])

  const goSpecies = (next: Species) => {
    setSpecies(next)
    setNavSpecies(next)
    navigate('/')
    setScrollToGrades(true)
  }

  return (
    <div className={navIdle ? 'page page--nav-idle' : 'page'}>
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault()
            setNavSpecies(null)
            navigate('/')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <PetfoodMark className="brand__mark" />
          <span className="brand__text">
            PETFOOD
            <small>사료 계급도</small>
          </span>
        </a>
        <nav className="topbar__nav" aria-label="바로가기">
          <button type="button" onClick={() => setMethodOpen(true)}>
            펫푸드 스코어
          </button>
          <button
            type="button"
            className={navSpecies === 'dog' ? 'is-on' : undefined}
            aria-current={navSpecies === 'dog' ? 'page' : undefined}
            onClick={() => goSpecies('dog')}
          >
            강아지 사료
          </button>
          <button
            type="button"
            className={navSpecies === 'cat' ? 'is-on' : undefined}
            aria-current={navSpecies === 'cat' ? 'page' : undefined}
            onClick={() => goSpecies('cat')}
          >
            고양이 사료
          </button>
          <button
            type="button"
            className={isBlog ? 'is-on' : undefined}
            aria-current={isBlog ? 'page' : undefined}
            onClick={() => {
              setNavSpecies(null)
              navigate('/blog')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            블로그
          </button>
        </nav>
      </header>

      {isBlog ? (
        <>
          {blogSlug && !activePost ? (
            <section className="blog">
              <div className="blog__head">
                <h2>글을 찾을 수 없습니다</h2>
                <p>삭제되었거나 주소가 잘못된 게시글입니다.</p>
              </div>
              <button type="button" className="blog-article__back" onClick={() => navigate('/blog')}>
                ← 목록
              </button>
            </section>
          ) : activePost ? (
            <BlogArticle
              post={activePost}
              onBack={() => navigate('/blog')}
              onOpen={(slug) => navigate(`/blog/${slug}`)}
            />
          ) : (
            <BlogList onOpen={(slug) => navigate(`/blog/${slug}`)} />
          )}
        </>
      ) : (
        <>
      <section className="hero" id="top">
        <div className="hero__panels" aria-hidden="true">
          <div className="hero__panel hero__panel--dog">
            <img src={heroDog} alt="" />
          </div>
          <div className="hero__panel hero__panel--cat">
            <img src={heroCat} alt="" />
          </div>
        </div>
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__center">
          <div className="hero-mark" aria-hidden="true">
            <PetfoodMark className="hero-mark__svg" />
          </div>
          <p className="hero__brand">PETFOOD</p>
          <h1>
            {speciesLabel} 사료 계급도
          </h1>
          <p className="hero__lead">한눈에 보는 강아지, 고양이 사료 브랜드</p>
          <div className="hero__cta">
            <div className="species-switch" role="group" aria-label="반려 종류">
              <button
                type="button"
                className={species === 'dog' ? 'is-on' : undefined}
                aria-pressed={species === 'dog'}
                onClick={() => setSpecies('dog')}
              >
                강아지
              </button>
              <button
                type="button"
                className={species === 'cat' ? 'is-on' : undefined}
                aria-pressed={species === 'cat'}
                onClick={() => setSpecies('cat')}
              >
                고양이
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="toc" id="grade-toc" aria-label="등급 미리보기">
        <div className="toc__inner toc__inner--six">
          {classTiers.map((t) => (
            <a
              key={t.code}
              className={`toc__item toc__item--${t.tone}`}
              href={`#tier-${t.code}`}
            >
              <em>{t.latin}</em>
              <strong>{t.name}</strong>
              <span>{t.brands.length}브랜드</span>
            </a>
          ))}
        </div>
      </section>

      <main className="ladder" id="ladder">
        <div className="ladder__head">
          <h2>
            {speciesLabel} 사료 계급도
            <span>{brandCount}개 브랜드</span>
          </h2>
          <p>{LADDER_ONE_LINER}</p>
        </div>

        {classTiers.map((tier) => (
          <section
            key={`${species}-${tier.code}`}
            className={`tier tier--${tier.tone}`}
            id={`tier-${tier.code}`}
          >
            <header className="tier__head">
              <div className="tier__badge">
                <span className="tier__latin">{tier.latin}</span>
                <strong>{tier.name}</strong>
              </div>
              <div className="tier__meta">
                <p>{tier.blurb}</p>
                <span>{tier.brands.length}개 브랜드</span>
              </div>
            </header>

            <ol className="tier__grid">
              {tier.brands.map((entry, index) => (
                <BrandEntry
                  key={`${species}-${tier.code}-${entry.brand}`}
                  entry={entry}
                  place={index + 1}
                  species={species}
                />
              ))}
            </ol>
          </section>
        ))}
      </main>

      <section className="situations" id="situations">
        <div className="situations__inner">
          <h2>사료 고르기가 힘들다면?</h2>
          <p>등급별로 고르기보다는 상황에 맞게 골라보세요!</p>
          <ul>
            {situations.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <span>{s.pick}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
        </>
      )}

      <footer className="site-footer">
        <p className="site-footer__copy">{LADDER_COPYRIGHT}</p>
        <p className="site-footer__note">
          {LADDER_DISCLAIMER_LINES[0]}
          <br />
          {LADDER_DISCLAIMER_LINES[1]}
        </p>
      </footer>

      {methodOpen && (
        <div
          className="modal-root"
          role="presentation"
          onClick={() => setMethodOpen(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="score-method-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal__head">
              <h2 id="score-method-title">펫푸드 스코어</h2>
              <button
                type="button"
                className="modal__close"
                aria-label="닫기"
                onClick={() => setMethodOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__body">
              <p>{LADDER_ONE_LINER}</p>
              <p>{GRADE_CONTROVERSY_NOTE}</p>
              <ul>
                <li>1등급 로가닉: 가공 방식별 최상위(4대천왕 포함)</li>
                <li>2등급 오가닉: 주식으로 먹기 좋은 상위권</li>
                <li>3등급 홀리스틱: 가격과 품질을 함께 보는 구간</li>
                <li>4등급 슈퍼 프리미엄: 고기 함량·보존료를 따지는 구간</li>
                <li>5등급 프리미엄: 구매 접근성이 쉬운 친근한 브랜드</li>
                <li>6등급 일반사료: OEM·저가 마트형</li>
              </ul>
            </div>
            <div className="modal__foot">
              <button
                type="button"
                className="modal__ok"
                onClick={() => setMethodOpen(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BrandEntry({
  entry,
  place,
  species,
}: {
  entry: TierBrand
  place: number
  species: Species
}) {
  const spec = resolveBrandSpec(entry, species)
  const kind = species === 'cat' ? '고양이 사료' : '강아지 사료'
  const href =
    spec?.coupangUrl ??
    `https://www.coupang.com/np/search?q=${encodeURIComponent(`${entry.brand} ${kind}`)}`
  const review = adaptCopyForSpecies(
    spec?.reviewNote || spec?.summary || '',
    species,
  )
  const origin = resolveOrigin(entry.brand)
  const tagline = adaptCopyForSpecies(entry.tagline, species)

  return (
    <li className="brand-card">
      <div className="brand-card__top">
        <div className="brand-card__rank" aria-hidden="true">
          {place}
        </div>
        <div className="brand-card__title">
          <h3>{entry.brand}</h3>
          <p>{tagline}</p>
        </div>
        <div className="brand-card__buy-col">
          <a
            className="brand-card__buy"
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            구매
          </a>
          {origin && (
            <span
              className="brand-card__origin"
              title={`제조국 ${origin.label}`}
              aria-label={`제조국 ${origin.label}`}
            >
              <span aria-hidden="true">{origin.flag}</span>
            </span>
          )}
        </div>
      </div>

      <div className="brand-card__body">
        {spec ? (
          <>
            {review && <p className="brand-card__summary">{review}</p>}
            {spec.disclosure === 'refused' && (
              <em className="brand-card__lock">함량 공개 거부</em>
            )}
          </>
        ) : (
          <p className="brand-card__empty-spec">
            성분·후기 데이터 미조사 · 구매에서 최신 함량을 확인하세요
          </p>
        )}
      </div>

      {spec &&
        (spec.disclosure === 'refused' ? (
          <div
            className="brand-card__emojis brand-card__emojis--locked"
            aria-label="함량 공개 거부"
          >
            <MetricStat emoji="🍖" label="고기" value="—" />
            <MetricStat emoji="🥛" label="단백" value="—" />
            <MetricStat emoji="⚪" label="키블" value="—" />
          </div>
        ) : (
          <div className="brand-card__emojis" aria-label="핵심 스펙">
            <MetricStat emoji="🍖" label="고기" value={String(spec.meatPercent)} />
            <MetricStat
              emoji="🥛"
              label="단백"
              value={String(spec.proteinPercent)}
            />
            <MetricStat
              emoji="⚪"
              label="키블"
              value={`${spec.kibbleSizeMm}mm`}
            />
          </div>
        ))}

      {spec && spec.tags.length > 0 && (
        <ul className="brand-card__tags">
          {spec.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </li>
  )
}

function MetricStat({
  emoji,
  label,
  value,
}: {
  emoji: string
  label: string
  value: string
}) {
  return (
    <span className="brand-card__metric" title={`${label} ${value}`}>
      <span className="brand-card__metric-emoji" aria-hidden="true">
        {emoji}
      </span>
      <span className="brand-card__metric-copy">
        <span className="brand-card__metric-label">{label}</span>
        <span className="brand-card__metric-value">{value}</span>
      </span>
    </span>
  )
}
