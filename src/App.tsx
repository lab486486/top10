import { useEffect, useMemo, useState } from 'react'
import { type Species } from './data/products'
import {
  CLASS_TIERS,
  LADDER_DISCLAIMER,
  LADDER_ONE_LINER,
  LADDER_SITUATIONS,
  coupangSearchUrl,
  findCatalogProducts,
  type TierBrand,
} from './data/ladder'
import { GRADE_CONTROVERSY_NOTE } from './data/score'
import heroDog from './assets/hero-dog.png'
import heroCat from './assets/hero-cat.png'
import './App.css'

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

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
            <svg viewBox="0 0 80 72" role="img">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f0d78c" />
                  <stop offset="45%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#8a6a12" />
                </linearGradient>
              </defs>
              <polygon
                points="40,4 76,68 4,68"
                fill="url(#goldGrad)"
                stroke="#5c4a0e"
                strokeWidth="1.5"
              />
              <line x1="22" y1="36" x2="58" y2="36" stroke="#5c4a0e" strokeWidth="1.2" opacity="0.55" />
              <line x1="15" y1="48" x2="65" y2="48" stroke="#5c4a0e" strokeWidth="1.2" opacity="0.55" />
              <line x1="9" y1="58" x2="71" y2="58" stroke="#5c4a0e" strokeWidth="1.2" opacity="0.55" />
              <text
                x="40"
                y="30"
                textAnchor="middle"
                fill="#3d3208"
                fontSize="9"
                fontWeight="700"
                fontFamily="Pretendard, sans-serif"
              >
                1
              </text>
            </svg>
          </div>
          <p className="hero__brand">펫푸드</p>
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
  const catalog = findCatalogProducts(entry)
  const primary = catalog[0]
  const href = primary?.coupangUrl ?? coupangSearchUrl(entry.brand)

  return (
    <li className="brand-card">
      <div className="brand-card__rank" aria-hidden="true">
        {place}
      </div>
      <div className="brand-card__body">
        <h3>{entry.brand}</h3>
        <p>{entry.tagline}</p>
        {primary && (
          <ul className="brand-card__specs">
            <li>고기 {primary.meatPercent}%</li>
            <li>단백 {primary.proteinPercent}%</li>
            <li>kg당 {formatWon(primary.pricePerKg)}</li>
          </ul>
        )}
      </div>
      <a
        className="brand-card__buy"
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        구매
      </a>
    </li>
  )
}
