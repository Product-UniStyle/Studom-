import { Link, useNavigate } from 'react-router-dom'
import { Search, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageShell from '../../components/layout/PageShell'
import Pagination from '../../components/ui/Pagination'
import FilterDropdown from '../../components/ui/FilterDropdown'
import { getPublicUniversityFacets, listPublicUniversities } from '../../lib/publicApi'
import type { PublicUniversityListItem } from '../../lib/publicApi'
import { useApplyFlow } from '../../context/ApplyFlowContext'

const PAGE_SIZE = 7
const ALL_LOCATIONS = 'All Locations'
const ALL_FIELDS = 'All Fields'

export default function SelectUniversitiesPage() {
  const { selectedUniversities, toggleUniversity } = useApplyFlow()
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('United Arab Emirates')
  const [location, setLocation] = useState(ALL_LOCATIONS)
  const [field, setField] = useState(ALL_FIELDS)
  const [applied, setApplied] = useState(false)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<PublicUniversityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [countries, setCountries] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [fields, setFields] = useState<string[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    getPublicUniversityFacets({ type: 'University' })
      .then((res) => {
        setCountries(res.countries)
        setFields(res.fieldsOfStudy)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    getPublicUniversityFacets({ type: 'University', country: country || undefined })
      .then((res) => setCities(res.cities))
      .catch(() => {})
  }, [country])

  useEffect(() => {
    setPage(1)
  }, [query, country, location, field])

  useEffect(() => {
    if (!applied) return
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      listPublicUniversities({
        type: 'University',
        search: query || undefined,
        country: country || undefined,
        city: location !== ALL_LOCATIONS ? location : undefined,
        fieldOfStudy: field !== ALL_FIELDS ? field : undefined,
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
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [applied, query, country, location, field, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const selectedIds = new Set(selectedUniversities.map((u) => u.id))

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-[1100px] px-[6.5rem] py-8">
        <div className="flex flex-col gap-4 rounded-full border border-black px-6 py-3 md:flex-row md:items-center md:divide-x md:divide-gray-300">
          <FilterDropdown
            label="Country"
            value={country}
            placeholder="Select country"
            options={country && !countries.includes(country) ? [country, ...countries] : countries}
            onChange={setCountry}
          />
          <FilterDropdown
            label="Location"
            value={location}
            placeholder={ALL_LOCATIONS}
            options={[ALL_LOCATIONS, ...cities]}
            onChange={setLocation}
          />
          <FilterDropdown
            label="Field of Study"
            value={field}
            placeholder={ALL_FIELDS}
            options={[ALL_FIELDS, ...fields]}
            onChange={setField}
          />
          <div className="flex justify-center pl-0 md:pl-6">
            <button
              onClick={() => setApplied(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="font-script text-3xl text-blue-600">
              Apply to Universities
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Select the universities you want to apply to using your saved
              profile.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search universities..."
                className="w-full rounded-full border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
              {selectedUniversities.length} selected
            </span>
            <button
              onClick={() => navigate('/apply/essays')}
              disabled={selectedUniversities.length === 0}
              className="whitespace-nowrap rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40"
            >
              Proceed
            </button>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {!applied ? (
          <p className="mt-10 text-center text-gray-400">
            Choose a country and click search to see universities.
          </p>
        ) : loading ? (
          <p className="mt-10 text-center text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-10 text-center text-gray-400">No universities found.</p>
        ) : (
          <div className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-100">
            {items.map((u) => {
              const selected = selectedIds.has(u._id)
              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <div className="font-semibold text-black">
                      {u.name}{' '}
                      <span className="ml-1 text-sm font-normal text-gray-400">
                        | {u.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      to={`/universities/${u.slug || u._id}`}
                      className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-black hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <button
                      onClick={() =>
                        toggleUniversity({ id: u._id, slug: u.slug, name: u.name, city: u.city, country: u.country, logo: u.logo })
                      }
                      className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold ${
                        selected
                          ? 'bg-green-600 text-white'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {selected && <Check className="h-4 w-4" />}
                      {selected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {applied && totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

        {applied && (
          <div className="mt-8">
            <span className="text-sm text-gray-500">
              {total} universities available
            </span>
          </div>
        )}
      </div>
    </PageShell>
  )
}
