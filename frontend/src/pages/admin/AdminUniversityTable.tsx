import { useCallback, useEffect, useState } from 'react'
import { Search, Pencil } from 'lucide-react'
import { listUniversities, getUniversity } from '../../lib/adminApi'
import type { UniversityListItem, UniversityDetail } from '../../lib/adminApi'
import Modal from '../../components/ui/Modal'
import AdminUniversityForm from './AdminUniversityForm'

const PAGE_SIZE = 20

export default function AdminUniversityTable({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<UniversityListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<UniversityDetail | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listUniversities({ search, page, limit: PAGE_SIZE })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load universities')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [search])

  async function openEdit(id: string) {
    setEditLoading(true)
    try {
      const detail = await getUniversity(id)
      setEditing(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load university')
    } finally {
      setEditLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-black">Uploaded Universities ({total})</h2>
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="pb-3 pr-4 font-medium">Logo</th>
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">City</th>
              <th className="pb-3 pr-4 font-medium">Country</th>
              <th className="pb-3 pr-4 font-medium">QS Rank</th>
              <th className="pb-3 pr-4 font-medium">Rating</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  No universities found.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 text-gray-800">
                  <td className="py-3 pr-4">
                    {u.logo ? (
                      <img src={u.logo} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100" />
                    )}
                  </td>
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4">{u.type}</td>
                  <td className="py-3 pr-4">{u.city || '-'}</td>
                  <td className="py-3 pr-4">{u.country || '-'}</td>
                  <td className="py-3 pr-4">{u.qsRank ?? '-'}</td>
                  <td className="py-3 pr-4">
                    {u.aggregateRating ? `${u.aggregateRating} (${u.aggregateReviewCount ?? 0})` : '-'}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => openEdit(u._id)}
                      disabled={editLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <Modal title={`Edit: ${editing.name}`} onClose={() => setEditing(null)}>
          <AdminUniversityForm
            university={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              load()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
