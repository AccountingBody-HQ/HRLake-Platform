'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const COUNTRIES = [
  { code: 'gb', name: 'United Kingdom' },
  { code: 'us', name: 'United States' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'za', name: 'South Africa' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'ke', name: 'Kenya' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'pl', name: 'Poland' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'ie', name: 'Ireland' },
]

export default function CountrySearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof COUNTRIES>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    const filtered = COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    )
    setResults(filtered.slice(0, 6))
    setOpen(filtered.length > 0)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(code: string) {
    setOpen(false)
    setQuery('')
    router.push(`/countries/${code}`)
  }

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search className="ml-4 text-slate-400 shrink-0" size={20} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any country — United Kingdom, Germany, Singapore…"
          className="flex-1 px-4 py-4 text-base text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
        />
        <button
          onClick={() => query && handleSelect(query.toLowerCase())}
          className="m-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {results.map(country => (
            <button
              key={country.code}
              onClick={() => handleSelect(country.code)}
              className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <img
                src={`https://flagcdn.com/24x18/${country.code}.png`}
                alt={country.name}
                width={24}
                height={18}
                className="rounded-sm shrink-0"
              />
              <span className="text-slate-800 font-medium">{country.name}</span>
              <span className="ml-auto text-slate-400 text-sm">View payroll data →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
