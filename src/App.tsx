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

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1800&q=80'

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

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [activeConcern, setActiveConcern] = useState<ConcernId | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activePreset = detectPreset(filters)
  const ranked = useMemo(() => rankProducts(products, filters), [filters])

  function patchFilters(patch: Partial<Filters>) {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...patch }))
    })
  }

  function applyPreset(id: Exclude<PresetId, 'custom'>) {
    setActiveConcern(null)
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        ...PRESETS[id].filters,
      }))
    })
  }

  function applyConcern(id: ConcernId) {
    const concern = CONCERNS.find((c) => c.id === id)
    if (!concern) return
    setActiveConcern(id)
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        ...concern.filters,
      }))
    })
  }

  return (
    <div className="page">
      <header className="topnav">
        <a className="topnav__brand" href="#top">
          골라먹
        </a>
        <SegmentedControl
          label="반려 종류"
          value={filters.species}
          options={[
            { value: 'dog', label: '강아지' },
            { value: 'cat', label: '고양이' },
          ]}
          onChange={(species) => patchFilters({ species })}
        />
      </header>

      <section className="hero" id="top" aria-label="골라먹 소개">
        <div className="hero__media" aria-hidden="true">
          <img
            src={HERO_IMAGE}
            alt=""
            width={1800}
            height={1200}
            fetchPriority="high"
          />
          <div className="hero__veil" />
        </div>

        <div className="hero__content">
          <p className="hero__eyebrow">조건으로 고르는 반려 사료</p>
          <h1 className="hero__brand">골라먹</h1>
          <p className="hero__headline">스마트폰 고르듯, 사료도 스펙으로</p>
          <p className="hero__sub">
            기본값을 열어두고, 내 조건에 맞게 순위를 다시 맞춘다
          </p>

          <div className="presets" role="group" aria-label="시작 프리셋">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((id) => (
              <button
                key={id}
                type="button"
                className={`preset${activePreset === id ? ' is-active' : ''}`}
                onClick={() => applyPreset(id)}
              >
                <span className="preset__label">{PRESETS[id].label}</span>
                <span className="preset__hint">{PRESETS[id].hint}</span>
              </button>
            ))}
          </div>

          <div className="concerns" aria-label="고민으로 시작">
            {CONCERNS.map((concern) => (
              <button
                key={concern.id}
                type="button"
                className={`concern${activeConcern === concern.id ? ' is-active' : ''}`}
                onClick={() => applyConcern(concern.id)}
              >
                {concern.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="main">
        <aside className={`panel${filtersOpen ? ' is-open' : ''}`}>
          <div className="panel__head">
            <div>
              <h2>세부 조건</h2>
              <p>기본값을 바탕으로 원하는 만큼만 조정하세요</p>
            </div>
            <button
              type="button"
              className="panel__toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              {filtersOpen ? '접기' : '펼치기'}
            </button>
          </div>

          <div className="panel__body">
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
                { value: 'any', label: '상관없음' },
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
                기호성 우선
              </ToggleChip>
              <ToggleChip
                checked={filters.prioritizeDiet}
                onChange={(prioritizeDiet) => patchFilters({ prioritizeDiet })}
              >
                다이어트 우선
              </ToggleChip>
            </div>
          </div>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results__head">
            <h2>
              {filters.species === 'dog' ? '강아지' : '고양이'} 사료 순위
            </h2>
            <p>
              조건에 맞는 <strong>{ranked.length}</strong>개 · 값을 바꾸면 순위가
              다시 정렬됩니다
            </p>
          </div>

          {ranked.length === 0 ? (
            <div className="empty">
              <p>조건이 너무 촘촘해요. 고기함량·가격·알 크기 중 하나를 조금 풀어보세요.</p>
              <button type="button" onClick={() => applyPreset('standard')}>
                표준 프리셋으로 돌아가기
              </button>
            </div>
          ) : (
            <ol className="rank-list">
              {ranked.map((product, index) => (
                <li key={product.id} className="rank-item">
                  <div className="rank-item__order" aria-hidden="true">
                    {index + 1}
                  </div>
                  <div className="rank-item__body">
                    <div className="rank-item__title">
                      <h3>
                        <span>{product.brand}</span> {product.name}
                      </h3>
                      <p>{product.summary}</p>
                    </div>

                    <dl className="specs">
                      <div>
                        <dt>고기</dt>
                        <dd>{product.meatPercent}%</dd>
                      </div>
                      <div>
                        <dt>알 크기</dt>
                        <dd>{product.kibbleSizeMm}mm</dd>
                      </div>
                      <div>
                        <dt>kg당</dt>
                        <dd>{formatWon(product.pricePerKg)}</dd>
                      </div>
                      <div>
                        <dt>단백</dt>
                        <dd>{product.proteinSource}</dd>
                      </div>
                    </dl>

                    {product.matchReasons.length > 0 && (
                      <ul className="reasons">
                        {product.matchReasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="rank-item__actions">
                    <div className="score" title="조건 적합 점수">
                      <span>적합</span>
                      <strong>{Math.round(product.score)}</strong>
                    </div>
                    <a
                      className="buy"
                      href={product.coupangUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                    >
                      쿠팡에서 보기
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          골라먹 초안 · 샘플 데이터 기준 순위입니다. 쿠팡 링크는 추후
          파트너스 트래킹 URL로 교체하세요.
        </p>
      </footer>
    </div>
  )
}
