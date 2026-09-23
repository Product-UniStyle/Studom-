import { useEffect, useRef, useState } from 'react'
import { Search, Upload, FileText, Clock, Mail, Folder, FolderPlus, ArrowLeft, Pencil } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PageLoading from '../../components/ui/PageLoading'
import Modal from '../../components/ui/Modal'
import TextField from '../../components/form/TextField'
import { studentNav } from './studentNav'
import {
  getStudentMe,
  listStudentDocuments,
  uploadStudentDocument,
  listDocumentFolders,
  createDocumentFolder,
  renameDocumentFolder,
} from '../../lib/studentApi'
import type { StudentProfile, StudentDocumentItem, DocumentFolderItem } from '../../lib/studentApi'
import { statusBadgeClass } from './statusBadge'
import { BUILD_PROFILE_DOCUMENT_FOLDER } from '../profile/profileTypes'

const UNCATEGORIZED = '__uncategorized__'

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [folders, setFolders] = useState<DocumentFolderItem[]>([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [documents, setDocuments] = useState<StudentDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [query, setQuery] = useState('')
  const [folderModal, setFolderModal] = useState<'create' | DocumentFolderItem | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderError, setFolderError] = useState<string | null>(null)
  const [folderSaving, setFolderSaving] = useState(false)

  function loadFolders() {
    return listDocumentFolders().then((res) => {
      setFolders(res.items)
      setUncategorizedCount(res.uncategorizedCount)
    })
  }

  function loadDocuments(folder: string) {
    setDocumentsLoading(true)
    return listStudentDocuments({ folder: folder === UNCATEGORIZED ? '__none__' : folder })
      .then((res) => setDocuments(res.items))
      .finally(() => setDocumentsLoading(false))
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), loadFolders()])
      .then(([me]) => {
        if (cancelled) return
        setStudent(me.student)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (activeFolder) loadDocuments(activeFolder).catch(() => {})
  }, [activeFolder])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !activeFolder) return
    setUploading(true)
    setError(null)
    try {
      const name = file.name.replace(/\.[^./]+$/, '')
      await uploadStudentDocument(file, name, undefined, activeFolder === UNCATEGORIZED ? undefined : activeFolder)
      await Promise.all([loadDocuments(activeFolder), loadFolders()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function closeFolderModal() {
    setFolderModal(null)
    setFolderName('')
    setFolderError(null)
  }

  async function handleFolderModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = folderName.trim()
    if (!trimmed) {
      setFolderError('Folder name is required')
      return
    }
    setFolderSaving(true)
    setFolderError(null)
    try {
      if (folderModal === 'create') {
        await createDocumentFolder(trimmed)
      } else if (folderModal) {
        await renameDocumentFolder(folderModal._id, trimmed)
        if (activeFolder === folderModal.name) setActiveFolder(trimmed)
      }
      await loadFolders()
      closeFolderModal()
    } catch (err) {
      setFolderError(err instanceof Error ? err.message : 'Failed to save folder')
    } finally {
      setFolderSaving(false)
    }
  }

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  )
  const uploadedCount = documents.filter((d) => d.status === 'Uploaded').length
  const pendingCount = documents.filter((d) => d.status === 'Pending').length
  const requestedCount = documents.filter((d) => d.status === 'Requested').length

  if (loading || !student) {
    return (
      <DashboardLayout navItems={studentNav} userName={student?.fullName || ''} userRole="Student">
        <PageLoading message={error || 'Loading...'} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">Documents</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage and upload your application documents.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {!activeFolder ? (
        <>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-semibold text-black">Folders</h2>
            <button
              onClick={() => {
                setFolderName('')
                setFolderModal('create')
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FolderPlus className="h-4 w-4" /> Add Folder
            </button>
          </div>

          {folders.length === 0 && uncategorizedCount === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-center text-gray-400">
                No folders yet. Add a folder to start uploading documents.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {folders.map((f) => (
                <div
                  key={f._id}
                  className="group relative flex flex-col items-start gap-3 rounded-2xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50/40"
                >
                  {f.name !== BUILD_PROFILE_DOCUMENT_FOLDER && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFolderName(f.name)
                        setFolderModal(f)
                      }}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 opacity-0 hover:bg-white hover:text-black group-hover:opacity-100"
                      aria-label={`Rename ${f.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button onClick={() => setActiveFolder(f.name)} className="flex w-full flex-col items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-black">{f.name}</div>
                      <div className="text-sm text-gray-500">
                        {f.documentCount} document{f.documentCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
              {uncategorizedCount > 0 && (
                <button
                  onClick={() => setActiveFolder(UNCATEGORIZED)}
                  className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-black">Uncategorized</div>
                    <div className="text-sm text-gray-500">
                      {uncategorizedCount} document{uncategorizedCount === 1 ? '' : 's'}
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveFolder(null)
                  setQuery('')
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="font-semibold text-black">
                {activeFolder === UNCATEGORIZED ? 'Uncategorized' : activeFolder}
              </h2>
              {activeFolder !== UNCATEGORIZED && activeFolder !== BUILD_PROFILE_DOCUMENT_FOLDER && (
                <button
                  onClick={() => {
                    const folder = folders.find((f) => f.name === activeFolder)
                    if (!folder) return
                    setFolderName(folder.name)
                    setFolderModal(folder)
                  }}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-black"
                  aria-label={`Rename ${activeFolder}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-full border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={FileText} value={String(uploadedCount)} label="Uploaded" color="blue" />
            <StatCard icon={Clock} value={String(pendingCount)} label="Pending" color="orange" />
            <StatCard icon={Mail} value={String(requestedCount)} label="Requested" color="purple" />
          </div>

          {documentsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <p className="text-center text-gray-400">Loading documents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-center text-gray-400">
                {documents.length === 0 ? "No documents in this folder yet." : 'No documents match your search.'}
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                    <th className="px-5 py-3 font-medium">Document</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Uploaded</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((d) => (
                    <tr key={d._id}>
                      <td className="flex items-center gap-2 px-5 py-4 font-medium text-black">
                        <FileText className="h-4 w-4 text-gray-400" /> {d.name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{d.category || '-'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                            d.status || ''
                          )}`}
                        >
                          {d.status || 'Uploaded'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {d.date ? new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {d.status !== 'Pending' && d.status !== 'Requested' ? (
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                            >
                              View
                            </a>
                          ) : (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {folderModal && (
        <Modal title={folderModal === 'create' ? 'Add Folder' : 'Rename Folder'} onClose={closeFolderModal}>
          <form onSubmit={handleFolderModalSubmit} className="space-y-4">
            <TextField
              label="Folder Name"
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Visa Documents"
            />
            {folderError && <p className="text-sm text-red-600">{folderError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeFolderModal}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={folderSaving}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {folderSaving ? 'Saving...' : folderModal === 'create' ? 'Create Folder' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof FileText
  value: string
  label: string
  color: 'blue' | 'orange' | 'purple'
}) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color]
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-6">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-black">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}
