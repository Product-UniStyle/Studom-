import { useCallback, useEffect, useState } from 'react'
import { Search, Pencil, Trash2, UploadCloud, Image as ImageIcon } from 'lucide-react'
import {
  deleteArticle,
  getArticle,
  importBlogSheet,
  importNewsSheet,
  listArticles,
} from '../../lib/adminApi'
import type { ArticleDetail, ArticleKind, ArticleListItem } from '../../lib/adminApi'
import Modal from '../../components/ui/Modal'
import AdminArticleForm from './AdminArticleForm'
import AdminImportModal from './AdminImportModal'

const PAGE_SIZE = 20

export default function AdminArticlesTab() {
  const [kind, setKind] = useState<ArticleKind>('news')
  const [items, setItems] = useState<ArticleListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [editing, setEditing] = useState<ArticleDetail | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleting, setDeleting] = useState<ArticleListItem | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listArticles(kind, { search, page, limit: PAGE_SIZE })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [kind, search, page])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  useEffect(() => {
    setPage(1)
    setSearch('')
  }, [kind])

  async function openEdit(id: string) {
    setEditLoading(true)
    try {
      const detail = await getArticle(kind, id)
      setEditing(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    try {
      await deleteArticle(kind, deleting._id)
      setDeleting(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const kindLabel = kind === 'news' ? 'News' : 'Blogs'

  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setKind('news')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              kind === 'news' ? 'bg-black text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            News
          </button>
          <button
            onClick={() => setKind('blogs')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              kind === 'blogs' ? 'bg-black text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Blogs
          </button>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800"
        >
          <UploadCloud className="h-3.5 w-3.5" /> Import {kindLabel} Sheet
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-black">
            {kindLabel} ({total})
          </h2>
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
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="pb-3 pr-4 font-medium">Cover</th>
                <th className="pb-3 pr-4 font-medium">Title</th>
                <th className="pb-3 pr-4 font-medium">Author</th>
                <th className="pb-3 pr-4 font-medium">Destination</th>
                <th className="pb-3 pr-4 font-medium">Published</th>
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
                    No {kindLabel.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                items.map((a) => (
                  <tr key={a._id} className="border-b border-gray-50 text-gray-800">
                    <td className="py-3 pr-4">
                      {a.coverImage ? (
                        <img src={a.coverImage} alt="" className="h-12 w-16 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gray-100 text-gray-300">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-medium">{a.title}</td>
                    <td className="py-3 pr-4">{a.author || '-'}</td>
                    <td className="py-3 pr-4">{a.destination || '-'}</td>
                    <td className="py-3 pr-4">
                      {a.publishedDate ? new Date(a.publishedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(a._id)}
                          disabled={editLoading}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleting(a)}
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

      {editing && (
        <Modal title={`Edit: ${editing.title}`} onClose={() => setEditing(null)}>
          <AdminArticleForm
            kind={kind}
            article={editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
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

      {showImportModal && (
        <AdminImportModal
          title={`Import ${kindLabel} Sheet`}
          description={
            <>
              Upload a workbook containing a <code>{kind === 'news' ? 'News' : 'Blogs'}</code> tab.
              Rows are matched by each article's Link so re-uploads update existing articles instead
              of duplicating them.
            </>
          }
          importFn={kind === 'news' ? importNewsSheet : importBlogSheet}
          onClose={() => setShowImportModal(false)}
          onImported={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
