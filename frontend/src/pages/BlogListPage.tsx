import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronDown } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import SafeImage from '../components/ui/SafeImage'
import { listPublicBlogs, getPublicBlogCategories } from '../lib/publicApi'
import type { PublicArticleListItem } from '../lib/publicApi'

const PAGE_SIZE = 6

function fmtDate(value?: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogListPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [items, setItems] = useState<PublicArticleListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPublicBlogCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      listPublicBlogs({ search: query || undefined, type: category || undefined, page, limit: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return
          setItems(res.items)
          setTotal(res.total)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof Error ? err.message : 'Failed to load blog posts')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, category, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <PageShell>
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
        <h1 className="text-3xl font-bold text-blue-600">Blog</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Insights, guides, and tips to help you navigate your education journey and student life in the Middle East.
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
              placeholder="Search blogs..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 py-2.5 pl-4 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="mt-16 text-center text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-16 text-center text-gray-400">No blog posts found.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <Link
                key={b._id}
                to={`/blog/${b.slug || b._id}`}
                className="group overflow-hidden rounded-xl border border-gray-100 hover:shadow-md"
              >
                <div className="relative">
                  <SafeImage src={b.coverImage} alt="" className="h-44 w-full object-cover" />
                  {b.type && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow">
                      {b.type}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-blue-700 group-hover:underline">{b.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600">
                      {(b.author || b.source || 'S').charAt(0)}
                    </span>
                    <span>{b.author || b.source || 'Studom Team'}</span>
                    <span>·</span>
                    <span>{fmtDate(b.publishedDate)}</span>
                    <span>·</span>
                    <span>{b.readingMinutes} min read</span>
                  </div>
                </div>
              </Link>
            ))}
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
    </PageShell>
  )
}
