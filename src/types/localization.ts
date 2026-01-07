/**
 * Localized string structure for JSON fields supporting ru/en/zh
 * Used across all content types for multi-language support
 */
export interface LocalizedString {
  ru: string
  en: string
  zh: string
}

/**
 * Product entity with minimal populated fields
 */
interface ProductReference {
  id: number
  documentId: string
}

/**
 * Portion entity from product-toportion junction table
 */
export interface ProductToPortionWithRelations {
  id: number
  documentId: string
  product?: ProductReference
  portion?: {
    id: number
    documentId: string
    name_by_locale: LocalizedString
  }
  price: number
}

/**
 * Ingredient entity from product-toingredient junction table
 */
export interface ProductToIngredientWithRelations {
  id: number
  documentId: string
  product?: ProductReference
  ingredient?: {
    id: number
    documentId: string
    name_by_locale: LocalizedString
    weight: string
  }
  priceModifier: number
}

/**
 * Temperature entity from product-totemperature junction table
 */
export interface ProductToTemperatureWithRelations {
  id: number
  documentId: string
  product?: ProductReference
  temperature?: {
    id: number
    documentId: string
    type: 'hot' | 'cold'
  }
}

/**
 * API response format for product prices
 */
export interface ProductPrice {
  weight: LocalizedString
  price: number
}

/**
 * API response format for additional ingredients
 */
export interface ProductAdditionalIngredient {
  name: LocalizedString
  weight: string
  priceModifier: number
}
