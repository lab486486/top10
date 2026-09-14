import type { Product } from '../data/products'
import type { Filters } from '../data/presets'
import {
  composeScore,
  getScoreBand,
  metricScores,
  MODE_WEIGHTS,
  type ScoreBand,
  type ScoreMode,
} from '../data/score'

export type RankedProduct = Product & {
  score: number
  scoreBand: ScoreBand
  matchReasons: string[]
  metricBreakdown: ReturnType<typeof metricScores>
}

function passesHardFilters(product: Product, filters: Filters): boolean {
  if (product.species !== filters.species) return false
  if (product.meatPercent < filters.meatMin) return false
  if (product.kibbleSizeMm > filters.kibbleMax) return false
  if (product.pricePerKg > filters.priceMaxPerKg) return false
  if (filters.vegetables === 'yes' && !product.hasVegetables) return false
  if (filters.vegetables === 'no' && product.hasVegetables) return false
  if (filters.grainFree && !product.grainFree) return false
  if (filters.singleProtein && !product.singleProtein) return false
  return true
}

function buildReasons(product: Product): string[] {
  const reasons: string[] = []
  if (product.meatPercent >= 50) reasons.push(`고기 ${product.meatPercent}%`)
  if (product.proteinPercent >= 28) reasons.push(`단백 ${product.proteinPercent}%`)
  if (product.pricePerKg <= 12000) {
    reasons.push(`kg당 ${product.pricePerKg.toLocaleString('ko-KR')}원`)
  }
  if (product.grainFree) reasons.push('그레인프리')
  if (product.singleProtein) reasons.push(`단일 ${product.proteinSource}`)
  if (product.kibbleSizeMm <= 9) reasons.push(`알 ${product.kibbleSizeMm}mm`)
  if (product.allergyFriendly) reasons.push('알러지 케어')
  return reasons.slice(0, 3)
}

export function rankProducts(
  products: Product[],
  filters: Filters,
  mode: ScoreMode,
): RankedProduct[] {
  const weights = MODE_WEIGHTS[mode]

  return products
    .filter((p) => passesHardFilters(p, filters))
    .map((product) => {
      const metricBreakdown = metricScores({
        meatPercent: product.meatPercent,
        proteinPercent: product.proteinPercent,
        pricePerKg: product.pricePerKg,
        grainFree: product.grainFree,
        singleProtein: product.singleProtein,
        allergyFriendly: product.allergyFriendly,
        kibbleSizeMm: product.kibbleSizeMm,
        preferSmallKibble: filters.preferSmallKibble,
      })
      const score = composeScore(metricBreakdown, weights)
      return {
        ...product,
        score,
        scoreBand: getScoreBand(score),
        matchReasons: buildReasons(product),
        metricBreakdown,
      }
    })
    .sort((a, b) => {
      if (mode === 'grade') {
        if (a.scoreBand.min !== b.scoreBand.min) return b.scoreBand.min - a.scoreBand.min
      }
      return b.score - a.score || a.pricePerKg - b.pricePerKg
    })
}
