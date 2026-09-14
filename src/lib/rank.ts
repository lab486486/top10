import type { Product } from '../data/products'
import type { Filters } from '../data/presets'

export type RankedProduct = Product & {
  score: number
  matchReasons: string[]
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

function scoreProduct(product: Product, filters: Filters): {
  score: number
  matchReasons: string[]
} {
  let score = 40
  const matchReasons: string[] = []

  const meatBonus = Math.min(30, (product.meatPercent - filters.meatMin) * 0.6)
  score += Math.max(0, meatBonus)
  if (product.meatPercent >= filters.meatMin + 15) {
    matchReasons.push(`고기 ${product.meatPercent}%`)
  }

  const kibbleRoom = filters.kibbleMax - product.kibbleSizeMm
  score += Math.min(12, Math.max(0, kibbleRoom) * 1.5)
  if (product.kibbleSizeMm <= 8) {
    matchReasons.push(`알 ${product.kibbleSizeMm}mm`)
  }

  const priceRoom =
    (filters.priceMaxPerKg - product.pricePerKg) / filters.priceMaxPerKg
  score += Math.min(18, Math.max(0, priceRoom) * 22)
  if (product.pricePerKg <= 10000) {
    matchReasons.push(`kg당 ${product.pricePerKg.toLocaleString('ko-KR')}원`)
  }

  if (filters.grainFree && product.grainFree) {
    score += 8
    matchReasons.push('그레인프리')
  }
  if (filters.singleProtein && product.singleProtein) {
    score += 10
    matchReasons.push(`단일 ${product.proteinSource}`)
  }
  if (product.allergyFriendly && (filters.grainFree || filters.singleProtein)) {
    score += 6
    matchReasons.push('알러지 케어')
  }

  if (filters.prioritizePalatability) {
    score += product.palatability * 6
    if (product.palatability >= 5) matchReasons.push('기호성 높음')
  } else {
    score += product.palatability * 2
  }

  if (filters.prioritizeDiet) {
    const dietBonus = Math.max(0, (3800 - product.calorieKcalPerKg) / 40)
    score += Math.min(20, dietBonus)
    if (product.calorieKcalPerKg <= 3200) matchReasons.push('저칼로리')
  }

  if (filters.vegetables === 'yes' && product.hasVegetables) {
    score += 4
    matchReasons.push('채소 포함')
  }
  if (filters.vegetables === 'no' && !product.hasVegetables) {
    score += 4
    matchReasons.push('채소 없음')
  }

  return { score: Math.round(score * 10) / 10, matchReasons: matchReasons.slice(0, 3) }
}

export function rankProducts(
  products: Product[],
  filters: Filters,
): RankedProduct[] {
  return products
    .filter((p) => passesHardFilters(p, filters))
    .map((product) => {
      const { score, matchReasons } = scoreProduct(product, filters)
      return { ...product, score, matchReasons }
    })
    .sort((a, b) => b.score - a.score || a.pricePerKg - b.pricePerKg)
}
