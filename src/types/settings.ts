export interface DiscountRange {
  min: number
  max: number | null
  discount: number
}

export interface GameSettings {
  id: number
  attempts_number: number
  discount_ranges: DiscountRange[]
}