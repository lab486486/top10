import { useEffect, useMemo, useState } from 'react'
import { products, type Species } from './data/products'
import {
  CLASS_TIERS,
  LADDER_DISCLAIMER,
  LADDER_ONE_LINER,
  LADDER_SITUATIONS,
  tierFromScore,
} from './data/ladder'
import {
  GRADE_CONTROVERSY_NOTE,
  MODE_WEIGHTS,
  SCORE_ONE_LINER,
  WEIGHT_LABELS,
} from './data/score'
import { rankProducts, type RankedProduct } from './lib/rank'
import { DEFAULT_FILTERS } from './data/presets'
import './App.css'

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export default function App() {
  const [species, setSpecies] = useState<Species>('dog')
  const [methodOpen, setMethodOpen] = useState(false)

  const ranked = useMemo(() => {
    const filters = {
      ...DEFAULT_FILTERS,
      species,
      meatMin: 0,
      kibbleMax: 99,
      priceMinPerKg: 0,
      priceMaxPerKg: 999999,
      preferSmallKibble: true,
      grainFree: false,
      singleProtein: false,
      brands: [],
      lifeStage: 'any' as const,
      mainProteins: [],
      kibbleBand: 'any' as const,
      hydrolyzed: false,
      glutenFree: false,
      lid: false,
    }
    return rankProducts(products, filters, 'rank')
  }, [species])

  const byTier = useMemo(() => {
    return CLASS_TIERS.map((tier) => ({
      tier,
      items: ranked.filter((p) => tierFromScore(p.score).code === tier.code),
    }))
  }, [ranked])

  const speciesLabel = species === 'dog' ? '강아지' : '고양이'
  const weights = MODE_WEIGHTS.rank

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
          <span className="brand__mark" aria-hidden="true">
            계
          </span>
          <span className="brand__text">
            펫푸드
            <small>사료 계급도</small>
          </span>
        </a>
        <nav className="topbar__nav" aria-label="바로가기">
          <a href="#ladder">계급도</a>
          <a href="#situations">상황별</a>
          <button type="button" onClick={() => setMethodOpen(true)}>
            산정 방식
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero__wash" aria-hidden="true" />
        <div className="hero__ladder" aria-hidden="true">
          {CLASS_TIERS.map((t) => (
            <span key={t.code} className={`hero__rung hero__rung--${t.tone}`}>
              {t.latin}
            </span>
          ))}
        </div>
        <div className="hero__inner">
          <p className="hero__brand">펫푸드</p>
          <h1>
            {speciesLabel}
            <br />
            사료 계급도
          </h1>
          <p className="hero__lead">
            다나와식 스펙표가 아니라, 한눈에 남는 서열표로 고릅니다.
          </p>
          <div className="hero__cta">
            <a className="btn-primary" href="#ladder">
              계급도 보기
            </a>
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

      <section className="toc" aria-label="계급 미리보기">
        <div className="toc__inner">
          {CLASS_TIERS.map((t) => (
            <a
              key={t.code}
              className={`toc__item toc__item--${t.tone}`}
              href={`#tier-${t.code}`}
            >
              <em>{t.rank}</em>
              <strong>{t.name}</strong>
              <span>{t.latin}</span>
            </a>
          ))}
        </div>
      </section>

      <main className="ladder" id="ladder">
        <div className="ladder__head">
          <h2>
            {speciesLabel} 계급도
            <span>{ranked.length}개 제품</span>
          </h2>
          <p>{LADDER_ONE_LINER}</p>
        </div>

        {ranked.length === 0 ? (
          <div className="empty">
            <p>
              {speciesLabel} 계급도 데이터는 준비 중입니다. 강아지 계급도를 먼저
              보세요.
            </p>
            <button type="button" onClick={() => setSpecies('dog')}>
              강아지 계급도 보기
            </button>
          </div>
        ) : (
          byTier.map(({ tier, items }) => (
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
                  <span>
                    {tier.min > 0 ? `스코어 ${tier.min}+` : '스코어 60 미만'} ·{' '}
                    {items.length}개
                  </span>
                </div>
              </header>

              {items.length === 0 ? (
                <p className="tier__empty">
                  {tier.code === 'S'
                    ? '아직 신성 계급에 오른 제품이 없습니다. 기준을 낮추지 않습니다.'
                    : '이 계급에 해당하는 제품이 아직 없습니다.'}
                </p>
              ) : (
                <ol className="tier__list">
                  {items.map((product, index) => (
                    <ProductEntry
                      key={product.id}
                      product={product}
                      place={index + 1}
                    />
                  ))}
                </ol>
              )}
            </section>
          ))
        )}
      </main>

      <section className="situations" id="situations">
        <div className="situations__inner">
          <h2>상황별로는 이렇게</h2>
          <p>1등급이 모든 아이에게 최선은 아닙니다.</p>
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

      <section className="method-teaser">
        <div className="method-teaser__inner">
          <div>
            <h2>점수는 이렇게 납니다</h2>
            <p>{SCORE_ONE_LINER}</p>
          </div>
          <ul className="weight-strip" aria-label="배점">
            {WEIGHT_LABELS.map(({ key, label }) => (
              <li key={key}>
                <span>{label}</span>
                <strong>{weights[key]}</strong>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-ghost" onClick={() => setMethodOpen(true)}>
            산정 방식 자세히
          </button>
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
              <h2 id="score-method-title">계급도 산정 방식</h2>
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
              <p>{SCORE_ONE_LINER}</p>
              <p>{GRADE_CONTROVERSY_NOTE}</p>
              <ul>
                <li>고기함량·조단백·kg당 가격·알러지 지표·알 크기를 0~100으로 환산</li>
                <li>공개 가중치로 합산해 100점 스코어 산출</li>
                <li>스코어 구간으로 신성·최상·상급·실속·보급 계급을 나눕니다</li>
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

function ProductEntry({
  product,
  place,
}: {
  product: RankedProduct
  place: number
}) {
  return (
    <li className="entry">
      <div className="entry__rank" aria-label={`${place}위`}>
        {place}
      </div>
      <div className="entry__body">
        <div className="entry__title">
          <span className="entry__brand">{product.brand}</span>
          <h3>{product.name}</h3>
        </div>
        <p className="entry__summary">{product.summary}</p>
        <p className="entry__note">{product.reviewNote}</p>
        <ul className="entry__tags">
          <li>고기 {product.meatPercent}%</li>
          <li>단백 {product.proteinPercent}%</li>
          <li>알 {product.kibbleSizeMm}mm</li>
          <li>kg당 {formatWon(product.pricePerKg)}</li>
          {product.tags.slice(0, 2).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
      <div className="entry__side">
        <div className="entry__score">
          <span>스코어</span>
          <strong>{Math.round(product.score)}</strong>
        </div>
        <a
          className="entry__buy"
          href={product.coupangUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
        >
          쿠팡 보기
        </a>
      </div>
    </li>
  )
}
