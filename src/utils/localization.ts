import { LocalizedString } from '../types/localization'

/**
 * Empty localized string constant for fallback values
 */
export const EMPTY_LOCALIZED_STRING: LocalizedString = {
  ru: '',
  en: '',
  zh: '',
} as const

/**
 * Validates and normalizes a LocalizedString object
 * Ensures all required locale keys exist with string values
 *
 * @param value - Potentially invalid/incomplete LocalizedString
 * @param fallback - Fallback value if validation fails
 * @returns Valid LocalizedString with all required keys
 *
 * @example
 * validateLocalizedString({ ru: "Test" }) // Returns { ru: "Test", en: "", zh: "" }
 * validateLocalizedString(null) // Returns { ru: "", en: "", zh: "" }
 */
export function validateLocalizedString(
  value: unknown,
  fallback: LocalizedString = EMPTY_LOCALIZED_STRING
): LocalizedString {
  if (!value || typeof value !== 'object') {
    return fallback
  }

  const obj = value as Record<string, unknown>

  return {
    ru: typeof obj.ru === 'string' ? obj.ru : fallback.ru,
    en: typeof obj.en === 'string' ? obj.en : fallback.en,
    zh: typeof obj.zh === 'string' ? obj.zh : fallback.zh,
  }
}

/**
 * Safely get a LocalizedString value with guaranteed structure
 *
 * @param value - Potentially undefined/null LocalizedString
 * @returns Valid LocalizedString with all required keys
 */
export function getLocalizedStringOrEmpty(
  value: LocalizedString | undefined | null
): LocalizedString {
  if (!value) return EMPTY_LOCALIZED_STRING

  return validateLocalizedString(value)
}
