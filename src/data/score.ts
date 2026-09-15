/** 펫푸드 스코어 — 공개 산식 상수 */

export type ScoreMode = 'rank' | 'grade' | 'value' | 'allergy'

export type ScoreWeights = {
  meat: number
  protein: number
  value: number
  allergy: number
  kibble: number
}

/** 기본(순위) 가중치 — 화면에도 그대로 공개 */
export const BASE_WEIGHTS: ScoreWeights = {
  meat: 30,
  protein: 20,
  value: 20,
  allergy: 20,
  kibble: 10,
}

export const MODE_WEIGHTS: Record<ScoreMode, ScoreWeights> = {
  rank: BASE_WEIGHTS,
  grade: { meat: 35, protein: 25, value: 10, allergy: 20, kibble: 10 },
  value: { meat: 20, protein: 15, value: 40, allergy: 15, kibble: 10 },
  allergy: { meat: 20, protein: 15, value: 10, allergy: 45, kibble: 10 },
}

export const SCORE_ONE_LINER =
  '펫푸드 스코어는 고기함량·조단백·kg당 가격·알러지 지표·알 크기 5개로 산출한 100점 비교 점수입니다. 시중 등급표·브랜드 마케팅 표기와는 별개입니다.'

export const SCORE_TRUST_LINES = [
  '5개 공개 지표 · 100점 환산',
  '가중치 공개 · 동일 공식으로 전 제품 재계산',
  '시중 등급표·광고 문구와 무관한 비교 스코어',
] as const

export const GRADE_CONTROVERSY_NOTE =
  '시중 “사료 등급표”는 공인 인증이 아니며 마케팅에 쓰이는 경우가 많습니다. 펫푸드는 공개 스펙으로만 점수를 매기고, 브랜드 표기는 참고로만 보여 줍니다.'

export const WEIGHT_LABELS: {
  key: keyof ScoreWeights
  label: string
  emoji: string
}[] = [
  { key: 'meat', label: '고기', emoji: '🍖' },
  { key: 'protein', label: '단백', emoji: '🥛' },
  { key: 'value', label: '가성비', emoji: '💰' },
  { key: 'allergy', label: '알러지', emoji: '🌿' },
  { key: 'kibble', label: '알크기', emoji: '⚪' },
]

export type ScoreBand = {
  code: 'S' | 'A' | 'B' | 'C' | 'D'
  min: number
  label: string
  short: string
}

/** 내부 밴드 코드는 쓰되, 화면에는 점수 구간으로 포장 */
export const SCORE_BANDS: ScoreBand[] = [
  { code: 'S', min: 90, label: '스코어 90+', short: '상위' },
  { code: 'A', min: 80, label: '스코어 80+', short: '상위권' },
  { code: 'B', min: 70, label: '스코어 70+', short: '중상' },
  { code: 'C', min: 60, label: '스코어 60+', short: '중위' },
  { code: 'D', min: 0, label: '스코어 60 미만', short: '보급' },
]

export function getScoreBand(score: number): ScoreBand {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]
}

export function clamp100(n: number) {
  return Math.max(0, Math.min(100, n))
}

/** 각 지표를 0~100으로 환산 */
export function metricScores(input: {
  meatPercent: number
  proteinPercent: number
  pricePerKg: number
  grainFree: boolean
  singleProtein: boolean
  allergyFriendly: boolean
  hasByproduct?: boolean
  kibbleSizeMm: number
  preferSmallKibble?: boolean
}) {
  const meat = clamp100(((input.meatPercent - 15) / (90 - 15)) * 100)

  // 조단백: 적정 구간(약 24~32%)에서 고득점, 과도하면 감점
  const p = input.proteinPercent
  let protein: number
  if (p < 18) protein = clamp100(((p - 12) / 6) * 55)
  else if (p <= 32) protein = clamp100(55 + ((p - 18) / 14) * 45)
  else if (p <= 38) protein = clamp100(100 - ((p - 32) / 6) * 35)
  else protein = clamp100(65 - ((p - 38) / 8) * 40)

  // 저렴할수록 고득점 (3천~4만 구간)
  const value = clamp100(
    ((40000 - input.pricePerKg) / (40000 - 3000)) * 100,
  )

  let allergy = 35
  if (input.grainFree) allergy += 25
  if (input.singleProtein) allergy += 25
  if (input.allergyFriendly) allergy += 15
  if (input.hasByproduct) allergy -= 20
  allergy = clamp100(allergy)

  // 기본은 소형견 친화(작을수록 가산), 너무 작아도 약간만 감점
  const ideal = input.preferSmallKibble === false ? 12 : 8
  const kibble = clamp100(100 - Math.abs(input.kibbleSizeMm - ideal) * 12)

  return { meat, protein, value, allergy, kibble }
}

export function composeScore(
  metrics: ReturnType<typeof metricScores>,
  weights: ScoreWeights,
) {
  const total =
    (metrics.meat * weights.meat +
      metrics.protein * weights.protein +
      metrics.value * weights.value +
      metrics.allergy * weights.allergy +
      metrics.kibble * weights.kibble) /
    100
  return Math.round(total * 10) / 10
}
