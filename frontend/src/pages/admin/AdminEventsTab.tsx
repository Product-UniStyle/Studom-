import { useCallback, useEffect, useState } from 'react'
import { Search, Pencil, Trash2, Plus } from 'lucide-react'
import { deleteEvent, getEvent, listEvents } from '../../lib/adminApi'
import type { EventDetail, EventListItem } from '../../lib/adminApi'
import Modal from '../../components/ui/Modal'
import AdminEventForm from './AdminEventForm'

const PAGE_SIZE = 20

export default function AdminEventsTab() {
  const [items, setItems] = useState<EventListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EventDetail | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleting, setDeleting] = useState<EventListItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listEvents({ search, page, limit: PAGE_SIZE })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  async function openEdit(id: string) {
    setEditLoading(true)
    try {
      const detail = await getEvent(id)
      setEditing(detail)
      setFormOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteEvent(deleting._id)
      setDeleting(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-black">Events ({total})</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <Plus className="h-3.5 w-3.5" /> Add Event
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Host University</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Mode</th>
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No events found.
                  </td>
                </tr>
              ) : (
                items.map((ev) => (
                  <tr key={ev._id} className="border-b border-gray-50 text-gray-800">
                    <td className="py-3 pr-4 font-medium">{ev.title}</td>
                    <td className="py-3 pr-4">{ev.universityId?.name || '-'}</td>
                    <td className="py-3 pr-4">{new Date(ev.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{ev.mode}</td>
                    <td className="py-3 pr-4">{ev.category || '-'}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(ev._id)}
                          disabled={editLoading}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleting(ev)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
      </div>

      {formOpen && (
        <Modal title={editing ? `Edit: ${editing.title}` : 'Add Event'} onClose={() => setFormOpen(false)}>
          <AdminEventForm
            event={editing}
            onCancel={() => setFormOpen(false)}
            onSaved={() => {
              setFormOpen(false)
              setRefreshKey((k) => k + 1)
            }}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete "${deleting.title}"?`} onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-600">This cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleting(null)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
