import { useEffect, useRef, useState } from 'react'
import { Search, Landmark } from 'lucide-react'
import { listPublicUniversities } from '../../lib/publicApi'
import type { PublicUniversityListItem } from '../../lib/publicApi'

interface PublicUniversityPickerProps {
  label?: string
  required?: boolean
  value: { id: string; name: string } | null
  onChange: (value: { id: string; name: string } | null) => void
}

export default function PublicUniversityPicker({
  label = 'University Name',
  required,
  value,
  onChange,
}: PublicUniversityPickerProps) {
  const [query, setQuery] = useState(value?.name || '')
  const [results, setResults] = useState<PublicUniversityListItem[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !query.trim() || query === value?.name) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      listPublicUniversities({ search: query, limit: 8 })
        .then((res) => setResults(res.items))
        .catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(t)
  }, [query, open, value?.name])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function select(u: PublicUniversityListItem) {
    onChange({ id: u._id, name: u.name })
    setQuery(u.name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(null)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for your university..."
          className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((u) => (
            <button
              key={u._id}
              type="button"
              onClick={() => select(u)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              <span className="font-medium text-gray-900">{u.name}</span>
              <span className="ml-auto text-xs text-gray-400">{u.city}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && !value && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-400">No matching university found.</p>
      )}
      {!open && query && !value && (
        <p className="mt-1 text-xs text-red-600">Please select your university from the search results.</p>
      )}
    </div>
  )
}
