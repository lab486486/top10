import type { ScoreBand } from './score'
import { SCORE_BANDS } from './score'

/** 화면용 계급도 메타 — 스코어 밴드와 1:1 */
export type ClassTier = {
  code: ScoreBand['code']
  rank: number
  name: string
  latin: string
  min: number
  blurb: string
  tone: 'god' | 's' | 'a' | 'b' | 'c'
}

export const CLASS_TIERS: ClassTier[] = [
  {
    code: 'S',
    rank: 1,
    name: '신성',
    latin: 'GOD',
    min: 90,
    blurb: '스펙·가성비·알러지 지표가 동시에 강한 최상위권',
    tone: 'god',
  },
  {
    code: 'A',
    rank: 2,
    name: '최상',
    latin: 'S',
    min: 80,
    blurb: '고기·단백이 탄탄하고 실사용에서도 무난한 상위권',
    tone: 's',
  },
  {
    code: 'B',
    rank: 3,
    name: '상급',
    latin: 'A',
    min: 70,
    blurb: '조건만 맞으면 충분히 좋은 선택 — 중상위',
    tone: 'a',
  },
  {
    code: 'C',
    rank: 4,
    name: '실속',
    latin: 'B',
    min: 60,
    blurb: '가격을 챙기면서도 스펙이 무너지지 않는 실속권',
    tone: 'b',
  },
  {
    code: 'D',
    rank: 5,
    name: '보급',
    latin: 'C',
    min: 0,
    blurb: '저가·특수 상황·정보 부족 쪽 — 주식은 신중히',
    tone: 'c',
  },
]

export function tierFromScore(score: number): ClassTier {
  const band = SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]
  return CLASS_TIERS.find((t) => t.code === band.code) ?? CLASS_TIERS[CLASS_TIERS.length - 1]
}

export const LADDER_ONE_LINER =
  '펫푸드 계급도는 고기함량·조단백·kg당 가격·알러지 지표·알 크기로 뽑은 공개 서열입니다. 시중 등급표·브랜드 마케팅과는 별개예요.'

export const LADDER_DISCLAIMER =
  '이 서열은 공인 인증이나 수의사 처방이 아닙니다. 개체별 건강·알러지·활동량에 따라 맞는 사료는 달라질 수 있습니다.'

export const LADDER_SITUATIONS: { title: string; pick: string }[] = [
  { title: '처음이라 안전하게', pick: '최상~상급에서 단일단백·그레인프리부터' },
  { title: '알러지·피부 예민', pick: '단일단백·L.I.D 태그가 있는 후보' },
  { title: '가성비 우선', pick: '실속 계급에서 kg당 가격을 먼저 보세요' },
  { title: '고기 함량 중시', pick: '신성·최상 계급의 고기%를 비교' },
]
