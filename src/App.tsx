import { useEffect, useMemo, useState } from 'react'
import { type Species } from './data/products'
import {
  CLASS_TIERS,
  LADDER_DISCLAIMER,
  LADDER_ONE_LINER,
  LADDER_SITUATIONS,
  resolveBrandSpec,
  type TierBrand,
} from './data/ladder'
import { GRADE_CONTROVERSY_NOTE } from './data/score'
import heroDog from './assets/hero-dog.png'
import heroCat from './assets/hero-cat.png'
import './App.css'

export default function App() {
  const [species, setSpecies] = useState<Species>('dog')
  const [methodOpen, setMethodOpen] = useState(false)

  const brandCount = useMemo(
    () => CLASS_TIERS.reduce((n, t) => n + t.brands.length, 0),
    [],
  )

  const speciesLabel = species === 'dog' ? '강아지' : '고양이'

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

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            펫푸드
            <small>사료 계급도</small>
          </span>
        </a>
        <nav className="topbar__nav" aria-label="바로가기">
          <a href="#ladder">계급도</a>
          <a href="#situations">상황별</a>
          <button type="button" onClick={() => setMethodOpen(true)}>
            안내
          </button>
        </nav>
      </header>

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
            <svg viewBox="0 0 72 72" role="img" className="hero-mark__svg">
              <defs>
                <linearGradient id="petGold" x1="18%" y1="8%" x2="86%" y2="92%">
                  <stop offset="0%" stopColor="#f7e7a8" />
                  <stop offset="38%" stopColor="#e0bc4a" />
                  <stop offset="72%" stopColor="#c4931f" />
                  <stop offset="100%" stopColor="#8a6410" />
                </linearGradient>
                <linearGradient id="petGoldSoft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff3c4" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
                <filter id="petSoft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor="#000" floodOpacity="0.28" />
                </filter>
              </defs>
              {/* badge ring */}
              <circle
                cx="36"
                cy="36"
                r="33"
                fill="rgba(12,14,18,0.22)"
                stroke="url(#petGoldSoft)"
                strokeWidth="1.4"
              />
              <circle
                cx="36"
                cy="36"
                r="28.5"
                fill="rgba(12,14,18,0.35)"
                stroke="rgba(240,215,140,0.28)"
                strokeWidth="0.8"
              />
              {/* stepped pyramid — grade ladder as brand mark */}
              <g filter="url(#petSoft)" fill="url(#petGold)">
                <path d="M36 14 L41.2 22.8 H30.8 Z" />
                <path d="M28.4 25.2 H43.6 L46.2 30.2 H25.8 Z" />
                <path d="M24.2 32.6 H47.8 L50.4 37.6 H21.6 Z" />
                <path d="M20 40 H52 L54.6 45 H17.4 Z" />
                <path d="M15.8 47.4 H56.2 L58.8 52.4 H13.2 Z" />
                <path d="M11.6 54.8 H60.4 L62.2 58.8 H9.8 Z" />
              </g>
              {/* highlight edge */}
              <path
                d="M36 14 L30.8 22.8 L25.8 30.2 L21.6 37.6 L17.4 45 L13.2 52.4 L9.8 58.8"
                fill="none"
                stroke="#fff6d0"
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.45"
              />
            </svg>
          </div>
          <p className="hero__brand">PETFOOD</p>
          <h1>
            {speciesLabel}
            <br />
            사료 계급도
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

      <section className="toc" aria-label="등급 미리보기">
        <div className="toc__inner toc__inner--six">
          {CLASS_TIERS.map((t) => (
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
            {speciesLabel} 계급도
            <span>{brandCount}개 브랜드</span>
          </h2>
          <p>{LADDER_ONE_LINER}</p>
        </div>

        {species === 'cat' ? (
          <div className="empty">
            <p>고양이 계급도는 준비 중입니다. 강아지 서열을 먼저 보세요.</p>
            <button type="button" onClick={() => setSpecies('dog')}>
              강아지 계급도 보기
            </button>
          </div>
        ) : (
          CLASS_TIERS.map((tier) => (
            <section
              key={tier.code}
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
                    key={`${tier.code}-${entry.brand}`}
                    entry={entry}
                    place={index + 1}
                  />
                ))}
              </ol>
            </section>
          ))
        )}
      </main>

      <section className="situations" id="situations">
        <div className="situations__inner">
          <h2>상황별로는 이렇게</h2>
          <p>윗등급이 모든 아이에게 최선은 아닙니다.</p>
          <ul>
            {LADDER_SITUATIONS.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <span>{s.pick}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="site-footer">
        <p>{LADDER_DISCLAIMER}</p>
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
              <h2 id="score-method-title">계급도 안내</h2>
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

function BrandEntry({ entry, place }: { entry: TierBrand; place: number }) {
  const spec = resolveBrandSpec(entry)
  const href = spec?.coupangUrl
  const review = spec?.reviewNote || spec?.summary

  return (
    <li className="brand-card">
      <div className="brand-card__top">
        <div className="brand-card__rank" aria-hidden="true">
          {place}
        </div>
        <div className="brand-card__title">
          <h3>{entry.brand}</h3>
          <p>{entry.tagline}</p>
        </div>
        <a
          className="brand-card__buy"
          href={href ?? `https://www.coupang.com/np/search?q=${encodeURIComponent(`${entry.brand} 강아지 사료`)}`}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          구매
        </a>
      </div>

      {spec ? (
        <>
          {spec.disclosure === 'refused' ? (
            <div
              className="brand-card__emojis brand-card__emojis--locked"
              aria-label="함량 공개 거부"
            >
              <span title="고기 함량">
                <span aria-hidden="true">🍖</span>
                <span className="brand-card__stat">:—</span>
              </span>
              <span title="조단백">
                <span aria-hidden="true">🥛</span>
                <span className="brand-card__stat">:—</span>
              </span>
              <span title="알 크기">
                <span aria-hidden="true">⚪</span>
                <span className="brand-card__stat">:—</span>
              </span>
              <em className="brand-card__lock">함량 공개 거부</em>
            </div>
          ) : (
            <div className="brand-card__emojis" aria-label="핵심 스펙">
              <span title="고기 함량">
                <span aria-hidden="true">🍖</span>
                <span className="brand-card__stat">:{spec.meatPercent}</span>
              </span>
              <span title="조단백">
                <span aria-hidden="true">🥛</span>
                <span className="brand-card__stat">:{spec.proteinPercent}</span>
              </span>
              <span title="알 크기(mm)">
                <span aria-hidden="true">⚪</span>
                <span className="brand-card__stat">:{spec.kibbleSizeMm}mm</span>
              </span>
            </div>
          )}
          {review && <p className="brand-card__summary">{review}</p>}
          {spec.tags.length > 0 && (
            <ul className="brand-card__tags">
              {spec.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="brand-card__empty-spec">
          성분·후기 데이터 미조사 · 구매에서 최신 함량을 확인하세요
        </p>
      )}
    </li>
  )
}
