import { products } from './products'

/** 편집 계급 — 시중 티어리스트 구조를 참고한 브랜드 서열 */
export type TierCode = 'S' | 'Aplus' | 'A' | 'common' | 'slave'

export type TierBrand = {
  brand: string
  tagline: string
  /** products.ts 의 brand 필드와 매칭 (있으면 스펙·쿠팡 연결) */
  catalogBrand?: string
}

export type ClassTier = {
  code: TierCode
  rank: number
  name: string
  latin: string
  blurb: string
  tone: 's' | 'aplus' | 'a' | 'common' | 'slave'
  brands: TierBrand[]
}

export const CLASS_TIERS: ClassTier[] = [
  {
    code: 'S',
    rank: 1,
    name: 'S급',
    latin: 'S',
    blurb: '가공 방식별 최상위 — 이른바 4대천왕',
    tone: 's',
    brands: [
      { brand: '디어니스트키친', tagline: '오븐베이크의 왕좌', catalogBrand: '디 어니스트 키친' },
      { brand: '스텔라앤츄이스', tagline: '동결건조의 왕좌' },
      { brand: '플래티넘', tagline: '소프트건식의 왕좌' },
      { brand: '지위픽', tagline: '에어드라이의 왕좌' },
    ],
  },
  {
    code: 'Aplus',
    rank: 2,
    name: 'A+',
    latin: 'A+',
    blurb: '주식으로도 설득력 있는 상위권 — S와 취향 싸움',
    tone: 'aplus',
    brands: [
      { brand: '워프', tagline: '소고기 동결건조 강자' },
      { brand: 'K9 내추럴', tagline: '동결건조 전통 강호' },
      { brand: '오리젠', tagline: '고단백 전통 강호', catalogBrand: '오리젠' },
      { brand: '테라카니스', tagline: '좋은 건 알겠는데 가격이…', catalogBrand: '테라카니스' },
      { brand: '아투', tagline: 'LID·고단백을 찾는다면', catalogBrand: '아투(AATU)' },
      { brand: '벨칸도', tagline: '익스트루전 생육 상위', catalogBrand: '벨칸도' },
      { brand: '젠틀베이크', tagline: '가성비 오븐베이크 파격' },
      { brand: '카르나4', tagline: '첨가물 없이 사료가 되나?', catalogBrand: '카르나4' },
      { brand: '고네이티브', tagline: '아일랜드발 미친 가성비' },
      { brand: '카니러브', tagline: '생육 60%, 더 싸게는 어렵죠' },
      { brand: '알레바', tagline: '고단백 이탈리아 감성', catalogBrand: '알레바' },
      { brand: '파미나', tagline: '이탈리아는 사료도 맛있다', catalogBrand: '파미나' },
      { brand: '허즈', tagline: '대만산, 원료 철학이 독특' },
      { brand: '인스팅트', tagline: '고기·고기·고기·고기', catalogBrand: '인스팅트' },
      { brand: '오픈팜', tagline: '동물복지 고기 지향' },
      { brand: '카나간', tagline: '스펙은 좋은데 호불호', catalogBrand: '카나간' },
      { brand: '노스포', tagline: '랍스터까지 넣는 과감함' },
      { brand: '맥아담스', tagline: '영국감 생육·고구마' },
    ],
  },
  {
    code: 'A',
    rank: 3,
    name: 'A급',
    latin: 'A',
    blurb: '쓸 만하지만 위에 브랜드가 너무 많은 구간',
    tone: 'a',
    brands: [
      { brand: '빅스비', tagline: '육류 함량 공개를 기다려' },
      { brand: '아카나', tagline: '오리젠 동생(중~고단백)', catalogBrand: '아카나' },
      { brand: '몬지', tagline: '이탈리아 전통 강호', catalogBrand: '몬지' },
      { brand: '브릿', tagline: '좋은데 품절이 잦다' },
      { brand: '써미트10', tagline: '가성비는 한 수 위' },
      { brand: '웰츠', tagline: '육류 80%! 구성은 따져볼 것', catalogBrand: '웰츠' },
      { brand: '오크팜', tagline: '리투아니아산 신흥' },
      { brand: '게더', tagline: '펫큐리안 3형제 중 첫째' },
      { brand: '빈티지', tagline: '이름만 빈티지' },
      { brand: '릴리스키친', tagline: '특수 상황·환자식 성격', catalogBrand: '릴리스 키친' },
      { brand: '토우', tagline: '패키지가 진짜 WILD' },
      { brand: '하림 더리얼', tagline: '국산 오븐베이크 감성', catalogBrand: '하림' },
      { brand: '나우', tagline: '펫큐리안 3형제 중 둘째' },
      { brand: '트라이벌', tagline: '콜드프레스, 중저단백' },
      { brand: '루시펫', tagline: '함량 공개하면 재평가' },
      { brand: '블루버팔로', tagline: '함량 공개하면 재평가' },
      { brand: 'GO!', tagline: '펫큐리안 3형제 중 셋째', catalogBrand: '고(GO!)' },
    ],
  },
  {
    code: 'common',
    rank: 4,
    name: '평민',
    latin: '평',
    blurb: '흔히 보이는 라인 — 브랜드 이미지와 원료 급이 어긋나기 쉬움',
    tone: 'common',
    brands: [
      { brand: '위시본', tagline: '뉴질랜드 소고기 감성' },
      { brand: '네추럴발란스', tagline: '네발 아이는 네발 사료?' },
      { brand: '피쉬포독', tagline: '눈물 자국 케어로 유명' },
      { brand: '힐스', tagline: '처방식은 인정' },
      { brand: '이즈칸', tagline: '조선의 아카나' },
      { brand: '로얄캐닌', tagline: '원료보다 설계·인지도' },
      { brand: '네츄럴코어', tagline: '라인업 제작 대장' },
      { brand: '프로플랜', tagline: '연구력은 있는데 급수는 논쟁' },
      { brand: '유카누바', tagline: '전통 프리미엄 마케팅권' },
    ],
  },
  {
    code: 'slave',
    rank: 5,
    name: '노예',
    latin: '노',
    blurb: '저가·OEM·마트형 — 주식으로 쓰기 전 제조·성분을 더 볼 것',
    tone: 'slave',
    brands: [
      { brand: '더마독', tagline: '셀럽 마케팅이 먼저' },
      { brand: '닥터독', tagline: 'OEM치고는 선전' },
      { brand: '건강백서', tagline: '이름과 내용의 온도 차' },
      { brand: '해피랑', tagline: '시골 마트형 저가' },
      { brand: '국가대표', tagline: '간식에 가깝다' },
      { brand: '원스', tagline: '훈련 ≠ 사료 전문' },
      { brand: '금동사료', tagline: '시설을 보면 망설여진다' },
      { brand: '잘먹잘싸', tagline: '시설을 보면 망설여진다' },
    ],
  },
]

/** 시중 “사료 등급표” (마케팅 분류) — 공인 인증 아님 */
export type MarketingGrade = {
  rank: number
  name: string
  english: string
  definition: string
  examples: string[]
}

export const MARKETING_GRADES: MarketingGrade[] = [
  {
    rank: 1,
    name: '로가닉',
    english: 'Rawganic',
    definition: 'Raw + Organic. 원물을 최대한 살린 자연식·생식 계열',
    examples: ['지위픽', '소조스', '오도독', '베지투볼'],
  },
  {
    rank: 2,
    name: '오가닉',
    english: 'Organic',
    definition: '농약·화학비료·항생제 없이 기른 유기농 원료 강조',
    examples: ['오가닉스', '야라', '오리젠', 'ANF 오가닉'],
  },
  {
    rank: 3,
    name: '홀리스틱',
    english: 'Holistic',
    definition: '합성 보존료·살충제 없이 깨끗하게 만든다는 마케팅 급',
    examples: ['웰니스', 'GO!', '나우', '캐니대', '프롬'],
  },
  {
    rank: 4,
    name: '슈퍼 프리미엄',
    english: 'Super Premium',
    definition: '고기 함량 높고 부산물·보존료를 줄였다는 급',
    examples: ['로얄캐닌', '뉴트로', '벨칸도', '내추럴발란스'],
  },
  {
    rank: 5,
    name: '프리미엄',
    english: 'Premium',
    definition: '주원료가 육류 부산물이고 기호성 첨가가 있는 급',
    examples: ['프로플랜', '유카누바', '뉴트라너겟'],
  },
  {
    rank: 6,
    name: '일반사료',
    english: 'Grocery',
    definition: '마트·저가형 주식 — 가격이 최우선인 구간',
    examples: ['알포', '도그차우', '하이프로', '루키'],
  },
]

export const LADDER_ONE_LINER =
  '브랜드를 S·A+·A·평민·노예로 나눈 편집 서열입니다. 시중 로가닉~일반 등급표(마케팅)와는 별개예요.'

export const LADDER_DISCLAIMER =
  '이 계급도는 공인 인증·수의사 처방이 아닙니다. 주관적 편집 서열이며, 개체별 건강·알러지·활동량에 따라 맞는 사료는 달라질 수 있습니다. 성분을 확인하고 소량부터 급여하세요.'

export const LADDER_SITUATIONS: { title: string; pick: string }[] = [
  { title: '처음이라 안전하게', pick: 'A+~A에서 단일단백·그레인프리부터' },
  { title: '가공 방식 중시', pick: 'S급 4대천왕(오븐·동결·소프트·에어)' },
  { title: '가성비 우선', pick: 'A급의 써미트·웰츠 등과 kg당 가격 비교' },
  { title: '저가만 보고 고르기 전', pick: '노예·평민은 원료·시설을 더 볼 것' },
]

export function findCatalogProducts(entry: TierBrand) {
  if (!entry.catalogBrand) return []
  return products.filter((p) => p.brand === entry.catalogBrand)
}

export function coupangSearchUrl(brand: string) {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(`${brand} 강아지 사료`)}`
}
