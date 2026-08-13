import { useEffect, useRef, useState } from 'react'
import { Search, Upload, FileText, Clock, Mail } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { studentNav } from './studentNav'
import { getStudentMe, listStudentDocuments, uploadStudentDocument } from '../../lib/studentApi'
import type { StudentProfile, StudentDocumentItem } from '../../lib/studentApi'
import { statusBadgeClass } from './statusBadge'

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [documents, setDocuments] = useState<StudentDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [query, setQuery] = useState('')

  function loadDocuments() {
    return listStudentDocuments().then((res) => setDocuments(res.items))
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentDocuments()])
      .then(([me, docs]) => {
        if (cancelled) return
        setStudent(me.student)
        setDocuments(docs.items)
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const name = file.name.replace(/\.[^./]+$/, '')
      await uploadStudentDocument(file, name)
      await loadDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
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
        <p className="mt-10 text-center text-gray-400">{error || 'Loading...'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">Documents</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage and upload your application documents.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} value={String(uploadedCount)} label="Uploaded" color="blue" />
        <StatCard icon={Clock} value={String(pendingCount)} label="Pending" color="orange" />
        <StatCard icon={Mail} value={String(requestedCount)} label="Requested" color="purple" />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-black">My Documents</h2>
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

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-gray-400">
          {documents.length === 0 ? "You haven't uploaded any documents yet." : 'No documents match your search.'}
        </p>
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

      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Required documents must be uploaded before universities can fully
        review your applications.
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row">
        <div>
          <div className="font-semibold text-black">Need Help?</div>
          <div className="text-sm text-gray-500">
            Our support team is here to assist you.
          </div>
        </div>
        <button className="shrink-0 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-white">
          Contact Support
        </button>
      </div>
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
