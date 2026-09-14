import { startTransition, useMemo, useState } from 'react'
import { products } from './data/products'
import {
  CONCERNS,
  DEFAULT_FILTERS,
  PRESETS,
  type ConcernId,
  type Filters,
  type PresetId,
  type VegPreference,
} from './data/presets'
import { rankProducts } from './lib/rank'
import { RangeField, SegmentedControl, ToggleChip } from './components/ui'
import './App.css'

function detectPreset(filters: Filters): PresetId {
  for (const id of ['standard', 'allergy', 'value'] as const) {
    const preset = PRESETS[id].filters
    const keys = Object.keys(preset) as (keyof Filters)[]
    if (keys.every((key) => filters[key] === preset[key])) return id
  }
  return 'custom'
}

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
  if (filters.prioritizePalatability) chips.push('기호성 우선')
  if (filters.prioritizeDiet) chips.push('다이어트 우선')
  return chips
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [activeConcern, setActiveConcern] = useState<ConcernId | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)

  const activePreset = detectPreset(filters)
  const ranked = useMemo(() => rankProducts(products, filters), [filters])
  const chips = buildChips(filters)
  const speciesLabel = filters.species === 'dog' ? '강아지' : '고양이'

  function patchFilters(patch: Partial<Filters>) {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...patch }))
    })
  }

  function applyPreset(id: Exclude<PresetId, 'custom'>) {
    setActiveConcern(null)
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...PRESETS[id].filters }))
    })
  }

  function applyConcern(id: ConcernId) {
    const concern = CONCERNS.find((item) => item.id === id)
    if (!concern) return
    setActiveConcern(id)
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...concern.filters }))
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
              <small>사료 스펙 비교</small>
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
              비교 커머스형 · 조건이 바뀌면 순위가 다시 계산됩니다
            </p>
            <h1>
              {speciesLabel} 사료,
              <em> 스펙으로 줄이고 바로 고르기</em>
            </h1>
            <p className="finder__desc">
              다나와처럼 스펙을 고르고, 네이버 쇼핑처럼 바로 구매로 이어집니다.
              감성 추천이 아니라 고기함량·알 크기·가격 조건으로 후보를 좁힙니다.
            </p>
          </div>

          <div className="mode-board">
            <div className="mode-board__block">
              <div className="mode-board__label">빠른 모드</div>
              <div className="mode-tabs" role="group" aria-label="시작 프리셋">
                {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(
                  (id) => (
                    <button
                      key={id}
                      type="button"
                      className={`mode-tab${activePreset === id ? ' is-active' : ''}`}
                      onClick={() => applyPreset(id)}
                    >
                      <strong>{PRESETS[id].label}</strong>
                      <span>{PRESETS[id].hint}</span>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="mode-board__block">
              <div className="mode-board__label">고민별 바로가기</div>
              <div className="concern-row">
                {CONCERNS.map((concern) => (
                  <button
                    key={concern.id}
                    type="button"
                    className={`concern-chip${activeConcern === concern.id ? ' is-active' : ''}`}
                    onClick={() => applyConcern(concern.id)}
                  >
                    {concern.label}
                  </button>
                ))}
              </div>
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
              <p>옵션 바꾸면 오른쪽 순위가 즉시 갱신</p>
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
                checked={filters.prioritizePalatability}
                onChange={(prioritizePalatability) =>
                  patchFilters({ prioritizePalatability })
                }
              >
                기호성↑
              </ToggleChip>
              <ToggleChip
                checked={filters.prioritizeDiet}
                onChange={(prioritizeDiet) => patchFilters({ prioritizeDiet })}
              >
                다이어트
              </ToggleChip>
            </div>
          </div>
        </aside>

        <section className="plp" id="results" aria-live="polite">
          <div className="plp__toolbar">
            <div>
              <h2>
                {speciesLabel} 사료 비교 결과
                <span>{ranked.length}개</span>
              </h2>
              <p>조건 적합 점수 순 · 스펙 변경 시 즉시 재정렬</p>
            </div>
          </div>

          <div className="plp__cols" aria-hidden="true">
            <span>순위 / 상품</span>
            <span>고기</span>
            <span>알</span>
            <span>kg당</span>
            <span>단백</span>
            <span>적합·구매</span>
          </div>

          {ranked.length === 0 ? (
            <div className="empty">
              <p>
                조건에 맞는 상품이 없습니다. 고기함량·가격·알 크기 중 하나를
                완화해 보세요.
              </p>
              <button type="button" onClick={() => applyPreset('standard')}>
                표준 모드로 초기화
              </button>
            </div>
          ) : (
            <ol className="product-list">
              {ranked.map((product, index) => (
                <li key={product.id} className="product-row">
                  <div className="product-row__main">
                    <div
                      className={`rank-badge${index < 3 ? ` is-top${index + 1}` : ''}`}
                    >
                      {index + 1}
                    </div>
                    <div className="product-row__info">
                      <div className="product-row__name">
                        <span className="brand">{product.brand}</span>
                        <h3>{product.name}</h3>
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
                  <div className="product-row__spec" data-label="알">
                    <em>{product.kibbleSizeMm}mm</em>
                  </div>
                  <div
                    className="product-row__spec is-price"
                    data-label="kg당"
                  >
                    <em>{formatWon(product.pricePerKg)}</em>
                  </div>
                  <div className="product-row__spec" data-label="단백">
                    <em>{product.proteinSource}</em>
                  </div>

                  <div className="product-row__buy">
                    <div className="fit-score" title="조건 적합 점수">
                      <span>적합</span>
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
              ))}
            </ol>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>
          골라먹 프로토타입 · 샘플 데이터 기준입니다. 쿠팡 링크는 파트너스
          트래킹 URL로 교체 예정입니다.
        </p>
      </footer>
    </div>
  )
}
