import { products } from './products'

/** 1~6등급 사료 계급도 */
export type TierCode = 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6'

export type TierBrand = {
  brand: string
  tagline: string
  /** products.ts 의 brand 필드와 매칭 (있으면 스펙·구매 연결) */
  catalogBrand?: string
}

export type ClassTier = {
  code: TierCode
  rank: number
  name: string
  latin: string
  blurb: string
  tone: 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6'
  brands: TierBrand[]
}

export const CLASS_TIERS: ClassTier[] = [
  {
    code: 'g1',
    rank: 1,
    name: '로가닉',
    latin: '1등급',
    blurb: '가공 방식별 최상위 — 이른바 4대천왕',
    tone: 'g1',
    brands: [
      { brand: '디어니스트키친', tagline: '오븐베이크의 왕좌', catalogBrand: '디 어니스트 키친' },
      { brand: '스텔라앤츄이스', tagline: '동결건조의 왕좌' },
      { brand: '플래티넘', tagline: '소프트건식의 왕좌' },
      { brand: '지위픽', tagline: '에어드라이의 왕좌' },
      { brand: '캐릭헬스', tagline: '로가닉 자연식 계열' },
      { brand: '베지투볼', tagline: '원물 살린 자연식' },
      { brand: '오도독', tagline: '생식·로가닉 감성' },
      { brand: '소조스', tagline: '생식 믹스 로가닉' },
    ],
  },
  {
    code: 'g2',
    rank: 2,
    name: '오가닉',
    latin: '2등급',
    blurb: 'S급 못지않으면서 주식으로 먹기에 좋은 브랜드',
    tone: 'g2',
    brands: [
      { brand: '오가닉스', tagline: '유기농 라인의 대표격' },
      { brand: '내추럴발란스 오가닉', tagline: '오가닉 라인 특화' },
      { brand: '야라', tagline: '유럽 유기농 사료' },
      { brand: '오리젠', tagline: '고단백 전통 강호', catalogBrand: '오리젠' },
      { brand: 'ANF 오가닉', tagline: '오가닉 표기 라인' },
      { brand: '리얼오가닉', tagline: '유기농 원료 강조' },
      { brand: '카르마', tagline: '오가닉 프리미엄' },
      { brand: '웨나위', tagline: '오가닉 후보군' },
      { brand: '워프', tagline: '소고기 동결건조 강자' },
      { brand: 'K9 내추럴', tagline: '동결건조 전통 강호' },
      { brand: '테라카니스', tagline: '좋은 건 알겠는데 가격이…', catalogBrand: '테라카니스' },
      { brand: '카르나4', tagline: '첨가물 없이 사료가 되나?', catalogBrand: '카르나4' },
    ],
  },
  {
    code: 'g3',
    rank: 3,
    name: '홀리스틱',
    latin: '3등급',
    blurb: '가격과 품질을 모두 만족스러운 브랜드',
    tone: 'g3',
    brands: [
      { brand: '웰니스', tagline: '홀리스틱 대표 브랜드' },
      { brand: 'GO!', tagline: '펫큐리안 계열 홀리스틱', catalogBrand: '고(GO!)' },
      { brand: '나우', tagline: '그레인프리 홀리스틱' },
      { brand: '캐니대', tagline: '홀리스틱 전통' },
      { brand: '프롬', tagline: '프롬 포스타 라인' },
      { brand: '이노바', tagline: '홀리스틱 클래식' },
      { brand: '내추럴코어 홀리스틱', tagline: '국산 홀리스틱 라인' },
      { brand: '내추럴발란스 홀리스틱', tagline: '홀리스틱 표기 라인' },
      { brand: 'ANF 홀리스틱', tagline: '홀리스틱 라인' },
      { brand: '이볼브', tagline: '홀리스틱 후보' },
      { brand: '헬스와이즈', tagline: '홀리스틱 후보' },
      { brand: '아투', tagline: 'LID·고단백을 찾는다면', catalogBrand: '아투(AATU)' },
      { brand: '인스팅트', tagline: '고기 중심 홀리스틱', catalogBrand: '인스팅트' },
      { brand: '파미나', tagline: '이탈리아 홀리스틱 감성', catalogBrand: '파미나' },
      { brand: '알레바', tagline: '고단백 이탈리아', catalogBrand: '알레바' },
      { brand: '카나간', tagline: '스펙은 좋은데 호불호', catalogBrand: '카나간' },
      { brand: '오픈팜', tagline: '동물복지 고기 지향' },
      { brand: '아카나', tagline: '오리젠 동생(중~고단백)', catalogBrand: '아카나' },
    ],
  },
  {
    code: 'g4',
    rank: 4,
    name: '슈퍼 프리미엄',
    latin: '4등급',
    blurb: '고기 함량이 높고 부산물·보존료를 줄인 슈퍼 프리미엄',
    tone: 'g4',
    brands: [
      { brand: '로얄캐닌', tagline: '설계·인지도 중심 슈퍼프리미엄' },
      { brand: '벨칸도', tagline: '익스트루전 생육 상위', catalogBrand: '벨칸도' },
      { brand: '내추럴발란스', tagline: '슈퍼프리미엄 대중 라인' },
      { brand: '뉴트로', tagline: '슈퍼프리미엄 대표' },
      { brand: '닥터 클라우더', tagline: '유럽 슈퍼프리미엄' },
      { brand: '뉴트라골드', tagline: '슈퍼프리미엄 후보' },
      { brand: '뉴트리소스', tagline: '슈퍼프리미엄 후보' },
      { brand: 'CJ 엔프레쉬', tagline: '국산 슈퍼프리미엄 마케팅' },
      { brand: '웰츠', tagline: '육류 80%! 구성은 따져볼 것', catalogBrand: '웰츠' },
      { brand: '하림 더리얼', tagline: '국산 오븐베이크 감성', catalogBrand: '하림' },
      { brand: '몬지', tagline: '이탈리아 전통 강호', catalogBrand: '몬지' },
      { brand: '젠틀베이크', tagline: '가성비 오븐베이크' },
      { brand: '카니러브', tagline: '생육 60% 슈퍼프리미엄' },
      { brand: '고네이티브', tagline: '아일랜드발 가성비' },
      { brand: '맥아담스', tagline: '영국감 생육·고구마' },
      { brand: '노스포', tagline: '랍스터까지 넣는 과감함' },
    ],
  },
  {
    code: 'g5',
    rank: 5,
    name: '프리미엄',
    latin: '5등급',
    blurb: '구매 접근성이 쉬운 친근한 브랜드',
    tone: 'g5',
    brands: [
      { brand: '프로플랜', tagline: '연구력 있는 친근한 프리미엄' },
      { brand: '유카누바', tagline: '전통 프리미엄' },
      { brand: '뉴트라너겟', tagline: '가격 친화 프리미엄' },
      { brand: '빌잭', tagline: '프리미엄 후보' },
      { brand: '스포트믹스', tagline: '마트에서도 보이는 프리미엄' },
      { brand: '이네이쳐', tagline: '프리미엄 후보' },
      { brand: '힐스', tagline: '처방식은 인정' },
      { brand: '이즈칸', tagline: '국산 프리미엄 감성' },
      { brand: '네츄럴코어', tagline: '라인업 제작 대장' },
      { brand: '피쉬포독', tagline: '눈물 자국 케어로 유명' },
      { brand: '위시본', tagline: '뉴질랜드 소고기 감성' },
      { brand: '릴리스키친', tagline: '특수 상황·환자식 성격', catalogBrand: '릴리스 키친' },
      { brand: '토우', tagline: '패키지가 진짜 WILD' },
      { brand: '블루버팔로', tagline: '함량 공개하면 재평가' },
      { brand: '써미트10', tagline: '가성비 프리미엄' },
      { brand: '브릿', tagline: '좋은데 품절이 잦다' },
    ],
  },
  {
    code: 'g6',
    rank: 6,
    name: '일반사료',
    latin: '6등급',
    blurb: 'OEM 방식의 저가 마트형 브랜드',
    tone: 'g6',
    brands: [
      { brand: '알포', tagline: '마트형 일반사료' },
      { brand: '도그차우', tagline: '저가 주식의 대명사' },
      { brand: '하이프로', tagline: '마트 저가형' },
      { brand: '루키', tagline: '저가 일반사료' },
      { brand: '프리미엄 엑셀', tagline: '이름만 프리미엄' },
      { brand: '프리미엄 진도', tagline: '마트형 일반' },
      { brand: '선샤인', tagline: '저가 포뮬러' },
      { brand: '캐니스', tagline: '일반사료' },
      { brand: '제로니', tagline: '일반사료' },
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

export const LADDER_ONE_LINER =
  '등급 기준은 펫푸드 스코어 및 소셜 미디어, 커뮤니티 등 의견을 종합한 점수입니다.'

export const LADDER_DISCLAIMER =
  '이 계급도는 공인 인증·수의사 처방이 아닙니다. 펫푸드 스코어와 커뮤니티 의견을 종합한 참고용이며, 개체별 건강·알러지·활동량에 따라 맞는 사료는 달라질 수 있습니다. 성분을 확인하고 소량부터 급여하세요.'

export const LADDER_SITUATIONS: { title: string; pick: string }[] = [
  { title: '처음이라 안전하게', pick: '2~3등급에서 단일단백·그레인프리부터' },
  { title: '가공 방식 중시', pick: '1등급 로가닉·4대천왕(오븐·동결·소프트·에어)' },
  { title: '가성비 우선', pick: '3~4등급에서 kg당 가격을 비교' },
  { title: '저가만 보고 고르기 전', pick: '5~6등급은 원료·시설을 더 볼 것' },
]

export function findCatalogProducts(entry: TierBrand) {
  if (!entry.catalogBrand) return []
  return products.filter((p) => p.brand === entry.catalogBrand)
}

export function coupangSearchUrl(brand: string) {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(`${brand} 강아지 사료`)}`
}
