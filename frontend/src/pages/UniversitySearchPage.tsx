import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, ChevronLeft, ChevronRight, MapPin, Landmark } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { getPublicUniversityFacets, listPublicUniversities } from '../lib/publicApi'
import type { PublicUniversityListItem } from '../lib/publicApi'

const ADDITIONAL_FILTERS = ['QS Ranking', 'Cost of Living', 'Student Population']

const TYPE_PARAM_MAP: Record<string, string> = {
  schools: 'School',
  school: 'School',
  universities: 'University',
  university: 'University',
  tuition: 'Tuition',
  college: 'College',
  colleges: 'College',
}

const TYPE_LABELS: Record<string, string> = {
  School: 'schools',
  University: 'universities',
  Tuition: 'tuition centres',
  College: 'colleges',
}

const PAGE_SIZE = 8

export default function UniversitySearchPage() {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || ''
  const type = TYPE_PARAM_MAP[typeParam.toLowerCase()] || ''

  const [country, setCountry] = useState('')
  const [location, setLocation] = useState('')
  const [field, setField] = useState('')
  const [additional, setAdditional] = useState('QS Ranking')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [applied, setApplied] = useState(false)

  const [items, setItems] = useState<PublicUniversityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [countries, setCountries] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [fields, setFields] = useState<string[]>([])

  useEffect(() => {
    setPage(1)
  }, [type])

  useEffect(() => {
    getPublicUniversityFacets({ type: type || undefined })
      .then((res) => {
        setCountries(res.countries)
        setFields(res.fieldsOfStudy)
      })
      .catch(() => {})
  }, [type])

  useEffect(() => {
    getPublicUniversityFacets({ type: type || undefined, country: country || undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {})
  }, [type, country])

  useEffect(() => {
    if (!applied) return
    let cancelled = false
    setLoading(true)
    setError(null)
    listPublicUniversities({
      search: query || undefined,
      type: type || undefined,
      country: country || undefined,
      city: location || undefined,
      fieldOfStudy: field || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load universities')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [applied, query, type, country, location, field, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const heading = useMemo(() => {
    if (type) return `Top ${TYPE_LABELS[type] || type} in ${location || 'all locations'}`
    if (field) return `Top universities for ${field} in ${location || 'all locations'}`
    return `Top universities in ${location || 'all locations'}`
  }, [type, field, location])

  const handleSearch = () => {
    setApplied(true)
    setPage(1)
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 rounded-full border border-black px-6 py-3 md:flex-row md:items-center md:gap-0 md:divide-x md:divide-gray-300">
          <FilterDropdown
            label="Country"
            value={country}
            placeholder="Select country"
            options={countries}
            onChange={(v) => {
              setCountry(v)
              setLocation('')
              setPage(1)
            }}
          />
          <FilterDropdown
            label="Location"
            value={location}
            placeholder="Select location"
            options={cities}
            onChange={(v) => {
              setLocation(v)
              setPage(1)
            }}
          />
          <FilterDropdown
            label="Field of Study"
            value={field}
            placeholder="Select field of study"
            options={fields}
            onChange={(v) => {
              setField(v)
              setPage(1)
            }}
          />
          <FilterDropdown
            label="Additional Filters"
            value={additional}
            placeholder="QS Ranking, Cost of Living, Student Population"
            options={ADDITIONAL_FILTERS}
            onChange={setAdditional}
          />
          <div className="flex justify-center pl-0 md:pl-6">
            <button
              onClick={handleSearch}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!applied ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Landmark className="h-16 w-16 text-gray-300" strokeWidth={1} />
            <h2 className="mt-6 text-2xl font-bold text-black">
              Please fill in the filters
            </h2>
            <p className="mt-2 text-gray-500">
              Choose your filters to explore universities.
            </p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-2xl font-bold text-black">{heading}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {total} result{total === 1 ? '' : 's'}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search universities..."
                  className="w-full rounded-full border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

            {loading ? (
              <p className="mt-10 text-center text-gray-400">Loading...</p>
            ) : items.length === 0 ? (
              <p className="mt-10 text-center text-gray-400">No results found.</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((u, idx) => (
                  <Link
                    to={`/universities/${u.slug || u._id}`}
                    key={u._id}
                    className="group relative overflow-hidden rounded-xl"
                  >
                    <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-black shadow">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </div>
                    <SafeImage
                      src={u.image}
                      alt={u.name}
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="text-sm font-semibold leading-snug">
                        {u.name}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {u.city || u.country || '-'}
                        </span>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                          {u.qsRank ? `QS Rank ${u.qsRank}` : 'Not QS Ranked'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </PageShell>
  )
}

function FilterDropdown({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex-1 px-0 md:px-6">
      <div className="text-sm font-semibold text-black">{label}</div>
      <div className="relative mt-0.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm text-gray-500 focus:outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-black">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = useMemo(() => {
    const nums = new Set<number>([1, 2, 3, 4, 5, totalPages])
    return Array.from(nums)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b)
  }, [totalPages])

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - pages[i - 1] > 1 && (
            <span className="text-gray-400">...</span>
          )}
          <button
            onClick={() => onChange(n)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
              n === page
                ? 'bg-red-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
