import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown, Bookmark, Tag, Layers } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { listPublicNews, getPublicNewsCategories } from '../lib/publicApi'
import type { PublicArticleListItem } from '../lib/publicApi'

const PAGE_SIZE = 6

function fmtDate(value?: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function NewsListPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [items, setItems] = useState<PublicArticleListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    getPublicNewsCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      listPublicNews({ search: query || undefined, type: category || undefined, sort, page, limit: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return
          setItems(res.items)
          setTotal(res.total)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'Failed to load news')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, category, sort, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-bold text-blue-600">News</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Stay updated with the latest education news, university updates, policy changes, scholarships, and
          opportunities across the Middle East.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search news..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Sort by:
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'latest' | 'oldest')}
                className="cursor-pointer appearance-none rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            </div>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading ? (
              <p className="py-16 text-center text-gray-400">Loading...</p>
            ) : items.length === 0 ? (
              <p className="py-16 text-center text-gray-400">No news articles found.</p>
            ) : (
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                {items.map((n) => (
                  <div key={n._id} className="flex flex-col gap-4 p-5 sm:flex-row">
                    <SafeImage
                      src={n.coverImage}
                      alt=""
                      className="h-32 w-full shrink-0 rounded-lg object-cover sm:h-24 sm:w-36"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {n.type && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-600">
                            {n.type}
                          </span>
                        )}
                        <span className="text-gray-400">{fmtDate(n.publishedDate)}</span>
                      </div>
                      <Link
                        to={`/news/${n.slug || n._id}`}
                        className="mt-1.5 block text-lg font-semibold text-blue-700 hover:underline"
                      >
                        {n.title}
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <Link to={`/news/${n.slug || n._id}`} className="text-sm font-medium text-blue-600 hover:underline">
                          Read more →
                        </Link>
                        <button
                          onClick={() => toggleSave(n._id)}
                          className={`flex shrink-0 items-center gap-1.5 text-sm font-medium ${
                            saved.has(n._id) ? 'text-blue-600' : 'text-gray-500 hover:text-black'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${saved.has(n._id) ? 'fill-blue-600' : ''}`} />
                          {saved.has(n._id) ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
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
                {totalPages > 5 && <span className="text-gray-400">...</span>}
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

          <aside className="space-y-6">
            <div className="rounded-2xl border border-gray-200 p-5">
              <h2 className="mb-3 text-lg font-semibold text-blue-600">Categories</h2>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCategory('')
                    setPage(1)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                    category === '' ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="h-4 w-4" /> All News
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c)
                      setPage(1)
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                      category === c ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Tag className="h-4 w-4" /> {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-blue-50/40 p-5">
              <h2 className="text-base font-semibold text-blue-600">Subscribe to our newsletter</h2>
              <p className="mt-1 text-sm text-gray-500">
                Get the latest education updates delivered to your inbox.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-3 flex flex-col gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
