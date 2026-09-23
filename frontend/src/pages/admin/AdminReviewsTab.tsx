import { useEffect, useState } from 'react'
import { Check, Star, X } from 'lucide-react'
import { listReviews, setReviewStatus } from '../../lib/adminApi'
import type { AdminReviewItem, ReviewStatus } from '../../lib/adminApi'

const TABS: { key: ReviewStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

export default function AdminReviewsTab() {
  const [tab, setTab] = useState<ReviewStatus>('pending')
  const [reviews, setReviews] = useState<AdminReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listReviews(tab)
      setReviews(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  async function handleStatus(review: AdminReviewItem, status: ReviewStatus) {
    setActingId(review._id)
    setError(null)
    try {
      await setReviewStatus(review._id, status)
      setReviews((prev) => prev.filter((r) => r._id !== review._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Student Reviews</h2>
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="p-4 font-medium">Reviewer</th>
              <th className="p-4 font-medium">University</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4 font-medium">Review</th>
              <th className="p-4 font-medium">Year of Passing</th>
              <th className="p-4 font-medium">ID Number</th>
              <th className="p-4 font-medium">Submitted</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  No {tab} reviews.
                </td>
              </tr>
            ) : (
              reviews.map((r) => {
                const university = typeof r.universityId === 'string' ? null : r.universityId
                return (
                  <tr key={r._id} className="border-b border-gray-50 align-top text-gray-800">
                    <td className="p-4 font-medium">{r.reviewerName}</td>
                    <td className="p-4">{university?.name || '-'}</td>
                    <td className="p-4">
                      {r.rating != null && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}
                        </span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs text-gray-600">{r.text}</td>
                    <td className="p-4">{r.yearOfPassing || '-'}</td>
                    <td className="p-4">{r.idNumber || '-'}</td>
                    <td className="p-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {tab !== 'approved' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatus(r, 'approved')}
                            disabled={actingId === r._id}
                            className="flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          {tab !== 'rejected' && (
                            <button
                              onClick={() => handleStatus(r, 'rejected')}
                              disabled={actingId === r._id}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          )}
                        </div>
                      )}
                      {tab === 'approved' && (
                        <button
                          onClick={() => handleStatus(r, 'rejected')}
                          disabled={actingId === r._id}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
