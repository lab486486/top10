import { startTransition, useEffect, useMemo, useState } from 'react'
import { products } from './data/products'
import {
  DEFAULT_FILTERS,
  DEFAULT_PRICE_CENTER,
  MODES,
  PRICE_SLIDER,
  PRICE_TOLERANCE,
  TOP_N,
  priceBandFromCenter,
  type Filters,
  type VegPreference,
} from './data/presets'
import {
  KIBBLE_BAND_OPTIONS,
  LIFE_STAGE_OPTIONS,
  PROTEIN_OPTIONS,
  type ProteinId,
} from './data/filterOptions'
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

function formatWonNum(value: number) {
  return value.toLocaleString('ko-KR')
}

function medalFor(index: number) {
  return { num: String(index + 1), label: `${index + 1}위` }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [mode, setMode] = useState<ScoreMode>('rank')
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [methodOpen, setMethodOpen] = useState(false)
  const [draftPrice, setDraftPrice] = useState(DEFAULT_PRICE_CENTER)
  const [appliedPrice, setAppliedPrice] = useState(DEFAULT_PRICE_CENTER)

  const draftBand = priceBandFromCenter(draftPrice)
  const appliedBand = priceBandFromCenter(appliedPrice)
  const priceDirty = draftPrice !== appliedPrice

  const allRanked = useMemo(
    () => rankProducts(products, filters, mode),
    [filters, mode],
  )
  const ranked = useMemo(() => allRanked.slice(0, TOP_N), [allRanked])
  const speciesLabel = filters.species === 'dog' ? '강아지' : '고양이'
  const activeWeights = MODE_WEIGHTS[mode]
  const brandOptions = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b, 'ko')),
    [],
  )

  function toggleInList<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
  }

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

  function applyPrice() {
    setAppliedPrice(draftPrice)
    patchFilters(priceBandFromCenter(draftPrice))
  }

  function resetToDefaultPrice() {
    setDraftPrice(DEFAULT_PRICE_CENTER)
    setAppliedPrice(DEFAULT_PRICE_CENTER)
    applyMode('rank')
    patchFilters({
      ...priceBandFromCenter(DEFAULT_PRICE_CENTER),
      grainFree: false,
      singleProtein: false,
    })
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead__inner masthead__inner--brand-only">
          <a className="logo" href="#top">
            <span className="logo__mark">펫</span>
            <span className="logo__text">
              펫푸드
              <small>멍냥이 사료비교</small>
            </span>
          </a>
        </div>
      </header>

      <section className="finder" id="top">
        <div className="finder__inner">
          <div className="finder__intro">
            <p className="finder__kicker">
              {speciesLabel} 사료 · 1kg 기준 예산
            </p>
            <h1>가격대만 선택하면 최고등급 사료가 검색됩니다!</h1>
            <p className="finder__desc">
              객관적인 펫푸드 스코어를 기반으로 광고없이 순위별로 정렬됩니다.
            </p>
          </div>

          <div className="portal-search" role="search" aria-label="가격대 찾기">
            <div className="portal-search__row">
              <div className="portal-search__main">
                <div className="portal-search__head">
                  <span>kg당 가격 (1kg 기준)</span>
                  <strong className="price-readout">
                    <span className="price-readout__center">{formatWon(draftPrice)}</span>
                    <span className="price-readout__band">
                      검색범위 {formatWonNum(draftBand.priceMinPerKg)}~
                      {formatWonNum(draftBand.priceMaxPerKg)}원
                    </span>
                  </strong>
                </div>

                <div className="price-range">
                  <input
                    type="range"
                    className="price-range__input"
                    min={PRICE_SLIDER.min}
                    max={PRICE_SLIDER.max}
                    step={PRICE_SLIDER.step}
                    value={draftPrice}
                    aria-label="kg당 기준 가격"
                    onChange={(e) => setDraftPrice(Number(e.target.value))}
                  />
                </div>

                <div className="portal-search__ends">
                  <span>최저 {formatWon(PRICE_SLIDER.min)}</span>
                  <span>최고 {formatWon(PRICE_SLIDER.max)}</span>
                </div>
              </div>

              <button
                type="button"
                className="price-apply"
                disabled={!priceDirty}
                onClick={applyPrice}
              >
                적용하기
              </button>
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
              검색 결과 <strong>{allRanked.length}개</strong> 확인! 스크롤을 내려
              최고의 사료를 확인하세요
              {priceDirty ? ' · 적용하기를 눌러 반영하세요' : ''}
            </p>
          </div>

          <div className="score-panel" aria-label="펫푸드 스코어 배점">
            <div className="score-panel__title-row">
              <h2 className="score-panel__title">펫푸드 스코어 배점</h2>
              <button
                type="button"
                className="method-toggle"
                onClick={() => setMethodOpen(true)}
              >
                점수 산정 방식 보기
              </button>
            </div>

            <div className="score-panel__trust">
              {SCORE_TRUST_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>

            <div className="weight-stack" aria-label="100점 배점 구성">
              <div className="weight-stack__caption-row">
                <span>100점 만점 구성</span>
                <strong>합계 100점</strong>
              </div>
              <div
                className="weight-stack__bar"
                role="img"
                aria-label={WEIGHT_LABELS.map(
                  ({ key, label }) => `${label} ${activeWeights[key]}점`,
                ).join(', ')}
              >
                {WEIGHT_LABELS.map(({ key, label }) => (
                  <i
                    key={key}
                    className={`weight-stack__seg weight-stack__seg--${key}`}
                    style={{ width: `${activeWeights[key]}%` }}
                    title={`${label} ${activeWeights[key]}점`}
                  />
                ))}
              </div>
              <ul className="weight-stack__legend">
                {WEIGHT_LABELS.map(({ key, label, emoji }) => (
                  <li
                    key={key}
                    className={`weight-stack__item weight-stack__item--${key}`}
                  >
                    <span className="weight-stack__label">
                      <span className="weight-stack__emoji" aria-hidden="true">
                        {emoji}
                      </span>
                      {label}
                    </span>
                    <span className="weight-stack__points">
                      <strong>{activeWeights[key]}</strong>
                      <span>점 / 100점</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="weight-stack__note">
                각 숫자는 100점 만점 스코어에서 해당 지표가 차지하는 배점입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="workspace">
        <aside className={`filter-rail${filtersOpen ? ' is-open' : ''}`}>
          <div className="filter-rail__head">
            <div>
              <h2>상세 조건</h2>
              <p>브랜드·연령·단백질·키블·알레르기</p>
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
            <SegmentedControl
              label="반려 종류"
              value={filters.species}
              options={[
                { value: 'dog', label: '강아지' },
                { value: 'cat', label: '고양이' },
              ]}
              onChange={(species) => patchFilters({ species })}
            />

            <div className="filter-group">
              <div className="filter-group__label">브랜드</div>
              <div className="chip-grid" role="group" aria-label="브랜드">
                {brandOptions.map((brand) => (
                  <ToggleChip
                    key={brand}
                    checked={filters.brands.includes(brand)}
                    onChange={() =>
                      patchFilters({ brands: toggleInList(filters.brands, brand) })
                    }
                  >
                    {brand}
                  </ToggleChip>
                ))}
              </div>
            </div>

            <SegmentedControl
              label="연령"
              value={filters.lifeStage}
              options={LIFE_STAGE_OPTIONS}
              onChange={(lifeStage) => patchFilters({ lifeStage })}
            />

            <div className="filter-group">
              <div className="filter-group__label">주 단백질원</div>
              <div className="chip-grid" role="group" aria-label="주 단백질원">
                {PROTEIN_OPTIONS.map((opt) => (
                  <ToggleChip
                    key={opt.value}
                    checked={filters.mainProteins.includes(opt.value)}
                    onChange={() =>
                      patchFilters({
                        mainProteins: toggleInList(
                          filters.mainProteins,
                          opt.value as ProteinId,
                        ),
                      })
                    }
                  >
                    {opt.label}
                  </ToggleChip>
                ))}
              </div>
            </div>

            <SegmentedControl
              label="키블 크기"
              value={filters.kibbleBand}
              options={KIBBLE_BAND_OPTIONS}
              onChange={(kibbleBand) => patchFilters({ kibbleBand })}
            />

            <div className="filter-group">
              <div className="filter-group__label">알레르기 방지</div>
              <div className="chip-grid" role="group" aria-label="알레르기 방지">
                <ToggleChip
                  checked={filters.hydrolyzed}
                  onChange={(hydrolyzed) => patchFilters({ hydrolyzed })}
                >
                  가수분해
                </ToggleChip>
                <ToggleChip
                  checked={filters.grainFree}
                  onChange={(grainFree) => patchFilters({ grainFree })}
                >
                  그레인프리
                </ToggleChip>
                <ToggleChip
                  checked={filters.glutenFree}
                  onChange={(glutenFree) => patchFilters({ glutenFree })}
                >
                  글루텐프리
                </ToggleChip>
                <ToggleChip
                  checked={filters.lid}
                  onChange={(lid) => patchFilters({ lid })}
                >
                  L.I.D
                </ToggleChip>
                <ToggleChip
                  checked={filters.singleProtein}
                  onChange={(singleProtein) => patchFilters({ singleProtein })}
                >
                  단일단백
                </ToggleChip>
              </div>
            </div>

            <RangeField
              label="고기 함량 최소"
              value={filters.meatMin}
              min={15}
              max={90}
              step={5}
              suffix="%"
              onChange={(meatMin) => patchFilters({ meatMin })}
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

            <div className="toggle-row" role="group" aria-label="점수 옵션">
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
                {formatWon(appliedBand.priceMinPerKg)}
                {' ~ '}
                {formatWon(appliedBand.priceMaxPerKg)} · {MODES[mode].label} 스코어 순
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
              <button type="button" onClick={resetToDefaultPrice}>
                기본 가격(1만원)으로 초기화
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
                            펫푸드 {product.scoreBand.label}
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
          펫푸드 스코어는 공개 성분·가격 정보 기반의 참고용 비교 지표이며, 공인
          인증이나 품질 보증이 아닙니다. 브랜드의 프리미엄 등 마케팅 표기와는
          별개입니다.
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
              <h2 id="score-method-title">점수 산정 방식</h2>
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
                <li>
                  고기함량·조단백·kg당 가격·알러지 지표·알 크기를 0~100으로
                  환산
                </li>
                <li>모드별 가중치로 합산해 100점 스코어 산출</li>
                <li>
                  1kg 기준 가격 지점의 ±{formatWon(PRICE_TOLERANCE)} 필터가 먼저
                  적용되고, 그 안에서 TOP {TOP_N}만 표시합니다
                </li>
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
