import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, Calendar, MapPin, Check, Video } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { listPublicEvents, getPublicEventCategories } from '../lib/publicApi'
import type { PublicEventListItem } from '../lib/publicApi'

const PAGE_SIZE = 8

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventsListPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [dateSort, setDateSort] = useState<'recent' | 'late' | 'all'>('recent')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [items, setItems] = useState<PublicEventListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPublicEventCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      listPublicEvents({
        search: query || undefined,
        category: category || undefined,
        status: tab,
        sort: dateSort === 'late' ? 'oldest' : undefined,
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
          setError(err instanceof Error ? err.message : 'Failed to load events')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [tab, dateSort, query, category, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const now = Date.now()

  return (
    <PageShell>
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-bold text-blue-600">Events</h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex shrink-0 rounded-xl bg-gray-100 p-1">
            {(['upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setPage(1)
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-black'
                }`}
              >
                {t === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search events..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="cursor-pointer appearance-none rounded-xl border border-gray-200 py-2.5 pl-4 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {tab === 'upcoming' && (
            <div className="flex shrink-0 gap-2">
              {(['recent', 'late', 'all'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setDateSort(s)}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
                    dateSort === s
                      ? 'border-blue-500 text-blue-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'recent' ? 'Recent Upcoming' : s === 'late' ? 'Late Upcoming' : 'All'}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="mt-16 text-center text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-16 text-center text-gray-400">No events found.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((e) => {
              const isPast = new Date(e.date).getTime() < now
              return (
                <Link
                  key={e._id}
                  to={`/events/${e.slug || e._id}`}
                  className="group overflow-hidden rounded-xl bg-[#101322] transition-shadow hover:shadow-lg"
                >
                  <div className="relative">
                    <SafeImage src={e.coverImage} alt="" className="h-40 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#101322] to-transparent" />
                    {isPast ? (
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                          <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />
                        </span>
                        Completed
                      </span>
                    ) : (
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-800 shadow">
                        {e.mode === 'Online' ? <Video className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                        {e.mode}
                      </span>
                    )}
                  </div>
                  <div className="px-4 pb-4 pt-2">
                    <h3 className="font-semibold leading-snug text-white">{e.title}</h3>
                    <div className="mt-1 text-sm text-gray-300">{e.universityId?.name}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-gray-200">
                      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                        <MapPin className="h-3 w-3" /> {e.venue || (e.mode === 'Online' ? 'Online' : 'TBA')}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                        <Calendar className="h-3 w-3" /> {fmtDate(e.date)}
                        {e.time ? ` · ${e.time}` : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  n === page ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
            {totalPages > 6 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
