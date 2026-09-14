import { startTransition, useMemo, useState } from 'react'
import { products } from './data/products'
import {
  DEFAULT_FILTERS,
  MODES,
  type Filters,
  type VegPreference,
} from './data/presets'
import {
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
    `고기 ${filters.meatMin}%↑`,
    `알 ${filters.kibbleMax}mm↓`,
    `kg당 ${formatWon(filters.priceMaxPerKg)}↓`,
  ]
  if (filters.vegetables === 'yes') chips.push('채소 포함')
  if (filters.vegetables === 'no') chips.push('채소 없음')
  if (filters.grainFree) chips.push('그레인프리')
  if (filters.singleProtein) chips.push('단일단백')
  return chips
}

function medalFor(index: number) {
  if (index === 0) return { emoji: '🥇', label: '1위' }
  if (index === 1) return { emoji: '🥈', label: '2위' }
  if (index === 2) return { emoji: '🥉', label: '3위' }
  return { emoji: String(index + 1), label: `${index + 1}위` }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [mode, setMode] = useState<ScoreMode>('rank')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [methodOpen, setMethodOpen] = useState(false)

  const ranked = useMemo(
    () => rankProducts(products, filters, mode),
    [filters, mode],
  )
  const chips = buildChips(filters)
  const speciesLabel = filters.species === 'dog' ? '강아지' : '고양이'
  const activeWeights = MODE_WEIGHTS[mode]

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

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead__inner">
          <a className="logo" href="#top">
            <span className="logo__mark">골</span>
            <span className="logo__text">
              골라먹
              <small>사료 순위·등급 비교</small>
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
              결과 {ranked.length}
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
              {speciesLabel} 사료순위 · 사료등급 비교
            </p>
            <h1>
              {speciesLabel} 사료,
              <em> 공개 스코어로 순위와 등급을 비교</em>
            </h1>
            <p className="finder__desc">{SCORE_ONE_LINER}</p>
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
                <p>
                  모든 제품에 같은 공식을 적용합니다. 브랜드가 ‘프리미엄’이라
                  표기해도, 골라먹 스코어는 공개 지표만으로 다시 계산합니다.
                </p>
                <ul>
                  <li>
                    고기함량·조단백·kg당 가격·알러지 지표·알 크기를 0~100으로
                    환산
                  </li>
                  <li>모드별 가중치로 합산해 100점 스코어 산출</li>
                  <li>
                    스코어 구간(90+/80+/70+/60+/60미만)은 비교용 밴드이며 공인
                    등급이 아닙니다
                  </li>
                  <li>브랜드 표기 등급은 참고용으로만 별도 표시합니다</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mode-board">
            <div className="mode-board__label">빠른 모드</div>
            <div className="mode-tabs" role="group" aria-label="점수 모드">
              {(Object.keys(MODES) as ScoreMode[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`mode-tab${mode === id ? ' is-active' : ''}`}
                  onClick={() => applyMode(id)}
                >
                  <strong>{MODES[id].label}</strong>
                  <span>{MODES[id].hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="spec-strip" aria-label="핵심 조건">
            <div className="spec-strip__item">
              <span>고기함량</span>
              <strong>{filters.meatMin}% 이상</strong>
            </div>
            <div className="spec-strip__item">
              <span>알 크기</span>
              <strong>{filters.kibbleMax}mm 이하</strong>
            </div>
            <div className="spec-strip__item">
              <span>kg당 가격</span>
              <strong className="is-price">
                {formatWon(filters.priceMaxPerKg)} 이하
              </strong>
            </div>
            <div className="spec-strip__item">
              <span>현재 매칭</span>
              <strong className="is-count">{ranked.length}개</strong>
            </div>
          </div>
        </div>
      </section>

      <main className="workspace">
        <aside className={`filter-rail${filtersOpen ? ' is-open' : ''}`}>
          <div className="filter-rail__head">
            <div>
              <h2>상세 조건</h2>
              <p>바꾸면 스코어·순위가 즉시 갱신</p>
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
            <RangeField
              label="kg당 가격 상한"
              value={filters.priceMaxPerKg}
              min={3000}
              max={40000}
              step={500}
              formatValue={(v) => formatWon(v)}
              onChange={(priceMaxPerKg) => patchFilters({ priceMaxPerKg })}
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
                {speciesLabel} 사료 {MODES[mode].label} 결과
                <span>{ranked.length}개</span>
              </h2>
              <p>
                골라먹 스코어 순 · 브랜드 표기 등급은 참고용으로만 표시합니다
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
                조건에 맞는 상품이 없습니다. 고기함량·가격·알 크기 중 하나를
                완화해 보세요.
              </p>
              <button type="button" onClick={() => applyMode('rank')}>
                순위별 모드로 초기화
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
                      >
                        {index < 3 ? (
                          <span className="rank-badge__medal" aria-hidden="true">
                            {medal.emoji}
                          </span>
                        ) : (
                          medal.emoji
                        )}
                        <span className="sr-only">{medal.label}</span>
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
                        {product.matchReasons.length > 0 && (
                          <ul className="match-tags">
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
