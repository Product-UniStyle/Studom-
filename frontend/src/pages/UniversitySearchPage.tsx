import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, ChevronDown, ChevronLeft, ChevronRight, MapPin, Landmark, Heart } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { getPublicUniversityFacets, listPublicUniversities } from '../lib/publicApi'
import { getStudentToken } from '../lib/studentApi'
import { getFavoriteIds, setFavoriteIds } from '../lib/favorites'
import type { PublicUniversityListItem } from '../lib/publicApi'

const ADDITIONAL_FILTERS = ['QS Ranking', 'Cost of Living', 'Student Population']

const MODE_OPTIONS = ['Online', 'Offline', 'Online/Offline', 'Home Tuition', 'Private Tutor']

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

const PAGE_SIZE = 20

export default function UniversitySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const typeParam = searchParams.get('type') || ''
  const type = TYPE_PARAM_MAP[typeParam.toLowerCase()] || ''

  const isSchool = type === 'School'
  const isTuition = type === 'Tuition'

  const country = searchParams.get('country') || ''
  const location = searchParams.get('location') || ''
  const field = searchParams.get('field') || 'All'
  const additional = searchParams.get('additional') || (isTuition ? '' : 'All')
  const query = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || '1')
  const applied = searchParams.get('applied') === '1'
  const isQsSorted = !isTuition && additional === 'QS Ranking'

  const updateParams = (
    patch: Record<string, string | undefined>,
    opts?: { resetPage?: boolean }
  ) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, value)
    })
    if (opts?.resetPage) next.set('page', '1')
    setSearchParams(next, { replace: true })
  }

  const previousType = useRef<string | undefined>(undefined)
  const navigate = useNavigate()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(getFavoriteIds()))

  const toggleFavorite = (id: string) => {
    if (!getStudentToken()) {
      setShowLoginPrompt(true)
      return
    }
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setFavoriteIds([...next])
      return next
    })
  }

  const [items, setItems] = useState<PublicUniversityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState(false)

  const [countries, setCountries] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [fields, setFields] = useState<string[]>([])
  const [grades, setGrades] = useState<string[]>([])

  useEffect(() => {
    getPublicUniversityFacets({ type: type || undefined })
      .then((res) => {
        setCountries(res.countries)
        setFields(res.fieldsOfStudy)
        setGrades(res.grades)
      })
      .catch(() => {})
    // Reset dependent filters only when the type is switched. On the first
    // mount (refresh, or Back from a detail page) the URL already holds the
    // user's filters, so keep them and only fill in a missing default country.
    if (previousType.current === undefined) {
      if (!country) updateParams({ country: 'United Arab Emirates' })
    } else if (previousType.current !== type) {
      updateParams(
        { field: undefined, additional: undefined, country: country || 'United Arab Emirates' },
        { resetPage: true }
      )
    }
    previousType.current = type
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  useEffect(() => {
    getPublicUniversityFacets({ type: type || undefined, country: country || undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {})
  }, [type, country])

  useEffect(() => {
    if (!applied || !country || !location) return
    let cancelled = false
    setLoading(true)
    setError(null)
    listPublicUniversities({
      search: query || undefined,
      type: type || undefined,
      country: country || undefined,
      city: location || undefined,
      fieldOfStudy: !isSchool && field !== 'All' ? field : undefined,
      grade: isSchool && field !== 'All' ? field : undefined,
      mode: isTuition && additional ? additional : undefined,
      sort: isQsSorted ? 'qsRank_asc' : undefined,
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
  }, [applied, query, type, isSchool, isTuition, country, location, field, additional, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const heading = useMemo(() => {
    if (type) return `Top ${TYPE_LABELS[type] || type} in ${location || 'all locations'}`
    if (field !== 'All') {
      return isSchool
        ? `Top schools for ${field} in ${location || 'all locations'}`
        : `Top universities for ${field} in ${location || 'all locations'}`
    }
    return `Top universities in ${location || 'all locations'}`
  }, [type, field, location, isSchool])

  const handleSearch = () => {
    if (!country || !location) {
      setFilterError(true)
      return
    }
    setFilterError(false)
    updateParams({ applied: '1' }, { resetPage: true })
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-[6.5rem] py-8">
        {/* Filter bar */}
        <div className="flex flex-col gap-4 rounded-full border border-black px-6 py-3 md:flex-row md:items-center md:gap-0 md:divide-x md:divide-gray-300">
          <FilterDropdown
            label="Country"
            value={country}
            placeholder="Select country"
            options={country && !countries.includes(country) ? [country, ...countries] : countries}
            onChange={(v) => {
              setFilterError(false)
              updateParams({ country: v, location: undefined }, { resetPage: true })
            }}
          />
          <FilterDropdown
            label="Location"
            value={location}
            placeholder="Select location"
            options={cities}
            onChange={(v) => {
              setFilterError(false)
              updateParams({ location: v }, { resetPage: true })
            }}
          />
          <FilterDropdown
            label={isSchool ? 'Grades' : 'Field of Study'}
            value={field}
            placeholder={isSchool ? 'Select grade' : 'Select field of study'}
            options={['All', ...(isSchool ? grades : fields)]}
            onChange={(v) => {
              updateParams({ field: v === 'All' ? undefined : v }, { resetPage: true })
            }}
          />
          <FilterDropdown
            label={isTuition ? 'Mode' : 'Additional Filters'}
            value={additional}
            placeholder={isTuition ? 'Select mode' : 'QS Ranking, Cost of Living, Student Population'}
            options={isTuition ? MODE_OPTIONS : ['All', ...ADDITIONAL_FILTERS]}
            onChange={(v) =>
              updateParams(
                { additional: !isTuition && v === 'All' ? undefined : v },
                { resetPage: true }
              )
            }
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

        {!applied || !country || !location ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Landmark className="h-16 w-16 text-gray-300" strokeWidth={1} />
            <h2 className="mt-6 text-2xl font-bold text-black">
              Please fill in the filters
            </h2>
            <p className="mt-2 text-gray-500">
              {filterError
                ? 'Country and location are required to search.'
                : 'Choose a country and location to explore universities.'}
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
                    updateParams({ q: e.target.value }, { resetPage: true })
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
                {items.map((u, i) => (
                  <Link
                    to={`/universities/${u.slug || u._id}`}
                    key={u._id}
                    className="group relative aspect-square overflow-hidden rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(u._id)
                      }}
                      aria-label={favorites.has(u._id) ? 'Remove from favourites' : 'Add to favourites'}
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow hover:bg-gray-50"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.has(u._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                      />
                    </button>
                    {additional === 'QS Ranking' && (
                      <div className="absolute left-3 top-3 z-10 flex h-8 min-w-8 items-center justify-center rounded-md bg-white px-2 text-sm font-bold text-black shadow">
                        #
                        {isQsSorted && u.qsRank
                          ? (page - 1) * PAGE_SIZE + i + 1
                          : u.qsRank || '-'}
                      </div>
                    )}
                    <SafeImage
                      src={u.image}
                      alt={u.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="truncate text-sm font-semibold leading-snug">
                        {u.name}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" /> {u.city || u.country || '-'}
                        </span>
                        {additional === 'Cost of Living' ? (
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                            {u.costOfLiving
                              ? `Cost of Living ${u.costOfLiving.toLocaleString()}`
                              : 'Cost of Living N/A'}
                          </span>
                        ) : additional === 'Student Population' ? (
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                            {u.studentPopulation
                              ? `Population ${u.studentPopulation.toLocaleString()}`
                              : 'Population N/A'}
                          </span>
                        ) : additional === 'QS Ranking' ? (
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                            {u.qsRank ? `QS Rank ${u.qsRank}` : 'Not QS Ranked'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => updateParams({ page: String(p) })}
            />
          </div>
        )}
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-black">Login required</h2>
            <p className="mt-2 text-sm text-gray-500">Please log in to add universities to your favourites.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/login')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative flex-1 px-0 md:px-6">
      <div className="text-sm font-semibold text-black">{label}</div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 flex w-full items-center justify-between gap-2 truncate bg-transparent text-left text-sm text-gray-500 focus:outline-none"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border border-gray-100 bg-white p-1.5 text-sm shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`block w-full truncate rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
                opt === value ? 'bg-blue-50 font-medium text-blue-600' : 'text-black'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
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
