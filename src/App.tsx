import { startTransition, useMemo, useState } from 'react'
import { products } from './data/products'
import {
  DEFAULT_FILTERS,
  MODES,
  PRICE_SLIDER,
  TOP_N,
  type Filters,
  type VegPreference,
} from './data/presets'
import {
  GRADE_CONTROVERSY_NOTE,
  MODE_WEIGHTS,
  SCORE_ONE_LINER,
  SCORE_TRUST_LINES,
  WEIGHT_LABELS,
  type ScoreMode,
} from './data/score'
import { rankProducts } from './lib/rank'
import { RangeField, SegmentedControl, ToggleChip } from './components/ui'
import './App.css'

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

function buildChips(filters: Filters): string[] {
  const chips = [
    `kg당 ${formatWon(filters.priceMinPerKg)}~${formatWon(filters.priceMaxPerKg)}`,
  ]
  if (filters.grainFree) chips.push('그레인프리')
  if (filters.singleProtein) chips.push('단일단백')
  if (filters.meatMin > 15) chips.push(`고기 ${filters.meatMin}%↑`)
  if (filters.kibbleMax < 16) chips.push(`알 ${filters.kibbleMax}mm↓`)
  if (filters.vegetables === 'yes') chips.push('채소 포함')
  if (filters.vegetables === 'no') chips.push('채소 없음')
  return chips
}

function medalFor(index: number) {
  return { num: String(index + 1), label: `${index + 1}위` }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [mode, setMode] = useState<ScoreMode>('rank')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [methodOpen, setMethodOpen] = useState(false)

  const allRanked = useMemo(
    () => rankProducts(products, filters, mode),
    [filters, mode],
  )
  const ranked = useMemo(() => allRanked.slice(0, TOP_N), [allRanked])
  const chips = buildChips(filters)
  const speciesLabel = filters.species === 'dog' ? '강아지' : '고양이'
  const activeWeights = MODE_WEIGHTS[mode]

  const priceSpanLabel =
    filters.priceMinPerKg <= PRICE_SLIDER.min &&
    filters.priceMaxPerKg >= PRICE_SLIDER.max
      ? '전체 가격대'
      : `${formatWon(filters.priceMinPerKg)} ~ ${formatWon(filters.priceMaxPerKg)}`

  function patchFilters(patch: Partial<Filters>) {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...patch }))
    })
  }

  function applyMode(next: ScoreMode) {
    setMode(next)
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...MODES[next].filters }))
    })
  }

  function setPriceMin(next: number) {
    patchFilters({
      priceMinPerKg: Math.min(next, filters.priceMaxPerKg - PRICE_SLIDER.step),
    })
  }

  function setPriceMax(next: number) {
    patchFilters({
      priceMaxPerKg: Math.max(next, filters.priceMinPerKg + PRICE_SLIDER.step),
    })
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead__inner">
          <a className="logo" href="#top">
            <span className="logo__mark">골</span>
            <span className="logo__text">
              골라먹
              <small>예산 먼저, 스코어로 TOP{TOP_N}</small>
            </span>
          </a>

          <div className="search-shell" role="search" aria-label="적용 조건 요약">
            <span className="search-shell__prefix">{speciesLabel}</span>
            <div className="search-shell__chips">
              {chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
            <button
              type="button"
              className="search-shell__cta"
              onClick={() =>
                document
                  .getElementById('results')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              TOP {ranked.length}
            </button>
          </div>

          <SegmentedControl
            label="반려 종류"
            value={filters.species}
            options={[
              { value: 'dog', label: '강아지' },
              { value: 'cat', label: '고양이' },
            ]}
            onChange={(species) => patchFilters({ species })}
          />
        </div>
      </header>

      <section className="finder" id="top">
        <div className="finder__inner">
          <div className="finder__intro">
            <p className="finder__kicker">
              {speciesLabel} 사료 · 예산대 추천
            </p>
            <h1>
              kg당 가격대를 잡고,
              <em> 골라먹 스코어 TOP {TOP_N}</em>
            </h1>
            <p className="finder__desc">
              예산을 먼저 고르면 그 안에서 스코어 순으로 추천합니다. 그레인프리·단일단백
              등은 아래에서 추가로 좁힐 수 있어요.
            </p>
          </div>

          <div className="portal-search" role="search" aria-label="가격대 찾기">
            <div className="portal-search__head">
              <span>kg당 가격대</span>
              <strong>{priceSpanLabel}</strong>
            </div>

            <div className="dual-range">
              <div
                className="dual-range__track"
                style={{
                  ['--min' as string]: `${((filters.priceMinPerKg - PRICE_SLIDER.min) / (PRICE_SLIDER.max - PRICE_SLIDER.min)) * 100}%`,
                  ['--max' as string]: `${((filters.priceMaxPerKg - PRICE_SLIDER.min) / (PRICE_SLIDER.max - PRICE_SLIDER.min)) * 100}%`,
                }}
              />
              <input
                type="range"
                className="dual-range__input"
                min={PRICE_SLIDER.min}
                max={PRICE_SLIDER.max}
                step={PRICE_SLIDER.step}
                value={filters.priceMinPerKg}
                aria-label="최소 kg당 가격"
                onChange={(e) => setPriceMin(Number(e.target.value))}
              />
              <input
                type="range"
                className="dual-range__input"
                min={PRICE_SLIDER.min}
                max={PRICE_SLIDER.max}
                step={PRICE_SLIDER.step}
                value={filters.priceMaxPerKg}
                aria-label="최대 kg당 가격"
                onChange={(e) => setPriceMax(Number(e.target.value))}
              />
            </div>

            <div className="portal-search__ends">
              <span>{formatWon(PRICE_SLIDER.min)}</span>
              <span>{formatWon(PRICE_SLIDER.max)}+</span>
            </div>

            <div className="portal-search__filters">
              <span className="portal-search__filters-label">추가 조건</span>
              <div className="toggle-row" role="group" aria-label="추가 조건">
                <ToggleChip
                  checked={filters.grainFree}
                  onChange={(grainFree) => patchFilters({ grainFree })}
                >
                  그레인프리
                </ToggleChip>
                <ToggleChip
                  checked={filters.singleProtein}
                  onChange={(singleProtein) => patchFilters({ singleProtein })}
                >
                  단일단백
                </ToggleChip>
                {(Object.keys(MODES) as ScoreMode[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`toggle-chip${mode === id ? ' is-on' : ''}`}
                    aria-pressed={mode === id}
                    onClick={() => applyMode(id)}
                  >
                    {MODES[id].label}
                  </button>
                ))}
              </div>
            </div>

            <p className="portal-search__hint">
              조건 매칭 {allRanked.length}개 중 · 골라먹 스코어 상위{' '}
              <strong>TOP {ranked.length}</strong>
            </p>
          </div>

          <div className="score-panel" aria-label="골라먹 스코어 안내">
            <div className="score-panel__trust">
              {SCORE_TRUST_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>

            <div className="weight-bars" aria-label="현재 모드 가중치">
              {WEIGHT_LABELS.map(({ key, label }) => (
                <div key={key} className="weight-bar">
                  <div className="weight-bar__meta">
                    <span>{label}</span>
                    <strong>{activeWeights[key]}</strong>
                  </div>
                  <div className="weight-bar__track">
                    <i style={{ width: `${activeWeights[key] * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="method-toggle"
              aria-expanded={methodOpen}
              onClick={() => setMethodOpen((v) => !v)}
            >
              {methodOpen ? '산정 방식 접기' : '점수 산정 방식 보기'}
            </button>

            {methodOpen && (
              <div className="method-detail">
                <p>{SCORE_ONE_LINER}</p>
                <p>{GRADE_CONTROVERSY_NOTE}</p>
                <ul>
                  <li>
                    고기함량·조단백·kg당 가격·알러지 지표·알 크기를 0~100으로
                    환산
                  </li>
                  <li>모드별 가중치로 합산해 100점 스코어 산출</li>
                  <li>
                    예산(kg당 가격대) 필터가 먼저 적용되고, 그 안에서 TOP {TOP_N}만
                    표시합니다
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="workspace">
        <aside className={`filter-rail${filtersOpen ? ' is-open' : ''}`}>
          <div className="filter-rail__head">
            <div>
              <h2>상세 조건</h2>
              <p>고기·알·채소 등 세부 필터</p>
            </div>
            <button
              type="button"
              className="filter-rail__toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              {filtersOpen ? '접기' : '펼치기'}
            </button>
          </div>

          <div className="filter-rail__body">
            <RangeField
              label="고기 함량 최소"
              value={filters.meatMin}
              min={15}
              max={90}
              step={5}
              suffix="%"
              onChange={(meatMin) => patchFilters({ meatMin })}
            />
            <RangeField
              label="알 크기 최대"
              value={filters.kibbleMax}
              min={6}
              max={16}
              step={1}
              suffix="mm"
              onChange={(kibbleMax) => patchFilters({ kibbleMax })}
            />

            <SegmentedControl<VegPreference>
              label="채소"
              value={filters.vegetables}
              options={[
                { value: 'any', label: '전체' },
                { value: 'yes', label: '포함' },
                { value: 'no', label: '없음' },
              ]}
              onChange={(vegetables) => patchFilters({ vegetables })}
            />

            <div className="toggle-row" role="group" aria-label="추가 조건">
              <ToggleChip
                checked={filters.grainFree}
                onChange={(grainFree) => patchFilters({ grainFree })}
              >
                그레인프리
              </ToggleChip>
              <ToggleChip
                checked={filters.singleProtein}
                onChange={(singleProtein) => patchFilters({ singleProtein })}
              >
                단일단백
              </ToggleChip>
              <ToggleChip
                checked={filters.preferSmallKibble}
                onChange={(preferSmallKibble) =>
                  patchFilters({ preferSmallKibble })
                }
              >
                소형 알 가산
              </ToggleChip>
            </div>
          </div>
        </aside>

        <section className="plp" id="results" aria-live="polite">
          <div className="plp__toolbar">
            <div>
              <h2>
                {speciesLabel} 예산대 TOP {TOP_N}
                <span>
                  {ranked.length}/{allRanked.length}
                </span>
              </h2>
              <p>
                {priceSpanLabel} · {MODES[mode].label} 스코어 순
              </p>
            </div>
          </div>

          <div className="plp__cols" aria-hidden="true">
            <span>순위 / 상품</span>
            <span>고기</span>
            <span>단백</span>
            <span>알</span>
            <span>kg당</span>
            <span>스코어·구매</span>
          </div>

          {ranked.length === 0 ? (
            <div className="empty">
              <p>
                이 가격대에 맞는 상품이 없습니다. 가격 범위를 넓히거나
                그레인프리·단일단백을 해제해 보세요.
              </p>
              <button
                type="button"
                onClick={() => {
                  applyMode('rank')
                  patchFilters({
                    priceMinPerKg: PRICE_SLIDER.min,
                    priceMaxPerKg: PRICE_SLIDER.max,
                    grainFree: false,
                    singleProtein: false,
                  })
                }}
              >
                가격대 전체로 초기화
              </button>
            </div>
          ) : (
            <ol className="product-list">
              {ranked.map((product, index) => {
                const medal = medalFor(index)
                return (
                  <li key={product.id} className="product-row">
                    <div className="product-row__main">
                      <div
                        className={`rank-badge${index < 3 ? ` is-top${index + 1}` : ''}`}
                        title={medal.label}
                        aria-label={medal.label}
                      >
                        <span className="rank-badge__num" aria-hidden="true">
                          {medal.num}
                        </span>
                      </div>
                      <div className="product-row__info">
                        <div className="product-row__name">
                          <span className="brand">{product.brand}</span>
                          <h3>{product.name}</h3>
                        </div>
                        <div className="grade-track">
                          <span className="grade-track__brand">
                            브랜드 표기: {product.brandGradeLabel}
                            <small>(참고)</small>
                          </span>
                          <span className="grade-track__score">
                            골라먹 {product.scoreBand.label}
                            <small>{product.scoreBand.short}</small>
                          </span>
                        </div>
                        <p>{product.summary}</p>
                        <p className="review-note">{product.reviewNote}</p>
                        {product.tags.length > 0 && (
                          <ul className="match-tags">
                            {product.tags.map((tag) => (
                              <li key={tag}>{tag}</li>
                            ))}
                          </ul>
                        )}
                        {product.matchReasons.length > 0 && (
                          <ul className="match-tags match-tags--reasons">
                            {product.matchReasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="product-row__spec" data-label="고기">
                      <em>{product.meatPercent}%</em>
                    </div>
                    <div className="product-row__spec" data-label="단백">
                      <em>{product.proteinPercent}%</em>
                    </div>
                    <div className="product-row__spec" data-label="알">
                      <em>{product.kibbleSizeMm}mm</em>
                    </div>
                    <div
                      className="product-row__spec is-price"
                      data-label="kg당"
                    >
                      <em>{formatWon(product.pricePerKg)}</em>
                    </div>

                    <div className="product-row__buy">
                      <div
                        className="fit-score"
                        title={`고기 ${Math.round(product.metricBreakdown.meat)} · 단백 ${Math.round(product.metricBreakdown.protein)} · 가성비 ${Math.round(product.metricBreakdown.value)} · 알러지 ${Math.round(product.metricBreakdown.allergy)} · 알 ${Math.round(product.metricBreakdown.kibble)}`}
                      >
                        <span>스코어</span>
                        <strong>{Math.round(product.score)}</strong>
                      </div>
                      <a
                        className="buy-btn"
                        href={product.coupangUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                      >
                        쿠팡 보기
                      </a>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          골라먹 스코어는 공개 성분·가격 정보 기반의 참고용 비교 지표이며, 공인
          인증이나 품질 보증이 아닙니다. 브랜드의 프리미엄 등 마케팅 표기와는
          별개입니다.
        </p>
      </footer>
    </div>
  )
}
