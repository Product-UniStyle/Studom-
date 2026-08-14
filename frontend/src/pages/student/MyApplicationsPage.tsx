import { useEffect, useState } from 'react'
import { Search, ChevronDown, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Modal from '../../components/ui/Modal'
import SafeImage from '../../components/ui/SafeImage'
import { studentNav } from './studentNav'
import { Landmark, CheckCircle2, Clock, ClipboardList } from 'lucide-react'
import { getStudentMe, listStudentApplications, getStudentApplication } from '../../lib/studentApi'
import type {
  StudentProfile,
  StudentApplicationItem,
  StudentApplicationEssay,
  StudentApplicationDocument,
} from '../../lib/studentApi'
import { statusBadgeClass } from './statusBadge'

export default function MyApplicationsPage() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [applications, setApplications] = useState<StudentApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<StudentApplicationItem | null>(null)
  const [essays, setEssays] = useState<StudentApplicationEssay[]>([])
  const [documents, setDocuments] = useState<StudentApplicationDocument[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)
    getStudentApplication(selectedId)
      .then((res) => {
        if (cancelled) return
        setDetail(res.application)
        setEssays(res.essays)
        setDocuments(res.documents)
      })
      .catch((err) => {
        if (cancelled) return
        setDetailError(err instanceof Error ? err.message : 'Failed to load application')
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  function closeDetail() {
    setSelectedId(null)
    setDetail(null)
    setEssays([])
    setDocuments([])
    setDetailError(null)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentApplications()])
      .then(([me, apps]) => {
        if (cancelled) return
        setStudent(me.student)
        setApplications(apps.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load applications')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = applications.filter((a) =>
    a.universityId.name.toLowerCase().includes(query.toLowerCase())
  )

  const submittedCount = applications.filter((a) => a.status === 'Submitted').length
  const underReviewCount = applications.filter((a) => a.status === 'Under Review').length
  const offerCount = applications.filter((a) => a.status === 'Offer Received').length

  if (loading || !student) {
    return (
      <DashboardLayout navItems={studentNav} userName={student?.fullName || ''} userRole="Student">
        <p className="mt-10 text-center text-gray-400">{error || 'Loading...'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">My Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Track and manage all your university applications in one place.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Landmark} value={String(applications.length)} label="Total Applications" color="blue" />
        <StatCard icon={CheckCircle2} value={String(submittedCount)} label="Submitted" color="green" />
        <StatCard icon={Clock} value={String(underReviewCount)} label="Under Review" color="blue" />
        <StatCard icon={ClipboardList} value={String(offerCount)} label="Offer Received" color="purple" />
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search universities"
            className="w-full rounded-full border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <FakeSelect label="All Status" />
          <FakeSelect label="Newest First" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-gray-400">
          {applications.length === 0 ? "You haven't applied to any universities yet." : 'No applications match your search.'}
        </p>
      ) : (
        <div className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200">
          {filtered.map((a) => (
            <div
              key={a._id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <SafeImage
                  src={a.universityId.logo}
                  alt=""
                  className="h-10 w-10 rounded-md border border-gray-100 object-contain p-1"
                />
                <div>
                  <div className="font-medium text-black">
                    {a.universityId.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {a.universityId.city}
                    {a.universityId.city && a.universityId.country ? ', ' : ''}
                    {a.universityId.country}
                  </div>
                  {a.course && <div className="text-xs text-gray-400">{a.course}</div>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm sm:gap-8">
                <div>
                  <div className="text-xs text-gray-400">Applied On</div>
                  <div className="font-medium text-black">
                    {new Date(a.appliedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Status</div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(a._id)}
                  className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  View Details
                </button>
                <button
                  disabled={a.status !== 'Offer Received'}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400 disabled:opacity-50 enabled:text-red-500 enabled:hover:bg-red-50"
                >
                  <Download className="h-4 w-4" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <Modal title="Application Detail" onClose={closeDetail}>
          {detailLoading || !detail ? (
            <p className="py-10 text-center text-gray-400">{detailError || 'Loading...'}</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={detail.universityId.logo}
                    alt=""
                    className="h-10 w-10 rounded-md border border-gray-100 object-contain p-1"
                  />
                  <div>
                    <div className="text-lg font-semibold text-black">{detail.universityId.name}</div>
                    <div className="text-sm text-gray-500">
                      {detail.universityId.city}
                      {detail.universityId.city && detail.universityId.country ? ', ' : ''}
                      {detail.universityId.country}
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(detail.status)}`}>
                  {detail.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 p-4 text-sm sm:grid-cols-3">
                <DetailField label="Course Applied For" value={detail.course} />
                <DetailField label="Application Ref" value={detail.applicationRef} />
                <DetailField
                  label="Date Applied"
                  value={new Date(detail.appliedOn).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-black">
                  Essay Responses {essays.length > 0 && `(${essays.length})`}
                </div>
                {essays.length === 0 ? (
                  <p className="text-sm text-gray-400">No essay questions were answered for this application.</p>
                ) : (
                  <div className="space-y-4 rounded-xl border border-gray-100 p-4">
                    {essays.map((e) => (
                      <div key={e._id}>
                        <div className="text-sm font-semibold text-black">{e.question}</div>
                        <p className="mt-1 text-sm text-gray-600">{e.answer || 'No response provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-black">
                  Documents {documents.length > 0 && `(${documents.length})`}
                </div>
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((d) => (
                      <a
                        key={d._id}
                        href={d.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5 text-sm hover:bg-gray-50"
                      >
                        <span className="font-medium text-black">{d.name}</span>
                        <span className="text-blue-600">View →</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {detailError && <p className="text-sm text-red-600">{detailError}</p>}
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-gray-700">{value || 'Not provided'}</div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Landmark
  value: string
  label: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color]

  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold text-black">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function FakeSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600">
      {label} <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>
  )
}
