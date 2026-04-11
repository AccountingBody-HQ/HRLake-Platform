/**
 * Derives a country flag emoji directly from an ISO2 country code.
 * This is fully dynamic — no database dependency, works for every country automatically.
 * Regional indicator letters start at U+1F1E6 (offset 0x1F1E6 - 0x41 from A)
 */
export function getFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return '🌐'
  const code = iso2.toUpperCase()
  const offset = 0x1F1E6 - 0x41
  return String.fromCodePoint(code.charCodeAt(0) + offset) +
         String.fromCodePoint(code.charCodeAt(1) + offset)
}
