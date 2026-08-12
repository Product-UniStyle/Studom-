import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { listUniversities } from '../../lib/adminApi'
import type { UniversityListItem } from '../../lib/adminApi'

interface UniversityPickerProps {
  name: string
  label?: string
  defaultValue?: { _id: string; name: string }
  required?: boolean
}

export default function UniversityPicker({ name, label = 'Host University', defaultValue, required }: UniversityPickerProps) {
  const [query, setQuery] = useState(defaultValue?.name || '')
  const [selectedId, setSelectedId] = useState(defaultValue?._id || '')
  const [results, setResults] = useState<UniversityListItem[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !query.trim() || query === defaultValue?.name) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      listUniversities({ search: query, limit: 8 })
        .then((res) => setResults(res.items))
        .catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(t)
  }, [query, open, defaultValue?.name])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function select(u: UniversityListItem) {
    setSelectedId(u._id)
    setQuery(u.name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input type="hidden" name={name} value={selectedId} required={required} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedId('')
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search for a university..."
          className="w-full rounded-lg border border-gray-200 py-3 pl-9 pr-4 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((u) => (
            <button
              key={u._id}
              type="button"
              onClick={() => select(u)}
              className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{u.name}</span>
              <span className="ml-2 text-xs text-gray-400">{u.city}</span>
            </button>
          ))}
        </div>
      )}
      {!selectedId && query && !open && (
        <p className="mt-1 text-xs text-red-600">Select a university from the search results.</p>
      )}
    </div>
  )
}
