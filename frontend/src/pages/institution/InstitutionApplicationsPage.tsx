import { useEffect, useState } from 'react'
import { Search, ChevronDown, SlidersHorizontal, MoreVertical } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Modal from '../../components/ui/Modal'
import { institutionNav } from './institutionNav'
import {
  getInstitutionMe,
  listInstitutionApplications,
  getInstitutionApplication,
  updateApplicationStatus,
} from '../../lib/institutionApi'
import type {
  InstitutionAccount,
  InstitutionApplicationItem,
  InstitutionApplicationDetail,
  InstitutionApplicationEssay,
  InstitutionApplicationDocument,
  ApplicationStatus,
} from '../../lib/institutionApi'
import { statusBadgeClass } from '../student/statusBadge'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Offer Received',
  'Rejected',
]

export default function InstitutionApplicationsPage() {
  const [account, setAccount] = useState<InstitutionAccount | null>(null)
  const [applications, setApplications] = useState<InstitutionApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InstitutionApplicationDetail | null>(null)
  const [essays, setEssays] = useState<InstitutionApplicationEssay[]>([])
  const [documents, setDocuments] = useState<InstitutionApplicationDocument[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [statusSaving, setStatusSaving] = useState(false)

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)
    getInstitutionApplication(selectedId)
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

  async function handleStatusChange(status: ApplicationStatus) {
    if (!selectedId) return
    setStatusSaving(true)
    try {
      const res = await updateApplicationStatus(selectedId, status)
      setDetail((prev) => (prev ? { ...prev, status: res.item.status } : prev))
      setApplications((prev) => prev.map((a) => (a._id === selectedId ? { ...a, status: res.item.status } : a)))
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setStatusSaving(false)
    }
  }

  function closeDetail() {
    setSelectedId(null)
    setDetail(null)
    setEssays([])
    setDocuments([])
    setDetailError(null)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getInstitutionMe(), listInstitutionApplications()])
      .then(([me, apps]) => {
        if (cancelled) return
        setAccount(me.account)
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

  const filtered = applications.filter(
    (a) =>
      a.studentId.fullName.toLowerCase().includes(query.toLowerCase()) ||
      a.studentId.email.toLowerCase().includes(query.toLowerCase())
  )

  const acceptedCount = applications.filter((a) => a.status === 'Offer Received').length
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length

  if (loading || !account) {
    return (
      <DashboardLayout navItems={institutionNav} userName={account?.universityName || ''} userRole="Institution">
        <p className="mt-10 text-center text-gray-400">{error || 'Loading...'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      navItems={institutionNav}
      userName={account.universityName}
      userRole="Institution"
    >
      <h1 className="text-2xl font-bold text-black">Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and manage applications received by your university.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FileText} value={String(applications.length)} label="Total Applications" sub="All time" color="blue" />
        <StatCard icon={Clock} value={String(applications.length - acceptedCount - rejectedCount)} label="Pending Review" sub="Require your attention" color="orange" />
        <StatCard icon={CheckCircle2} value={String(acceptedCount)} label="Accepted" sub="Successful admits" color="green" />
        <StatCard icon={XCircle} value={String(rejectedCount)} label="Rejected" sub="Unsuccessful admits" color="red" />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name or email"
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <FakeSelect label="All Courses" />
        <FakeSelect label="All Statuses" />
        <FakeSelect label="All Intakes" />
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600">
          <SlidersHorizontal className="h-4 w-4" /> More Filters
        </button>
        <button onClick={() => setQuery('')} className="text-sm font-medium text-blue-600">
          Clear
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Showing {filtered.length} of {applications.length} applications</span>
        <FakeSelect label="Latest First" />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-gray-400">
          {applications.length === 0 ? 'No applications received yet.' : 'No applications match your search.'}
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="px-5 py-3 font-medium">Student Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Course Applied For</th>
                <th className="px-5 py-3 font-medium">Date Applied</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Viewed</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a._id}>
                  <td className="px-5 py-4 font-medium text-black">{a.studentId.fullName}</td>
                  <td className="px-5 py-4 text-gray-500">{a.studentId.email}</td>
                  <td className="px-5 py-4 text-gray-500">{a.course || '-'}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(a.appliedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {a.lastViewed ? new Date(a.lastViewed).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedId(a._id)}
                        className="text-sm font-medium text-blue-600"
                      >
                        View Application →
                      </button>
                      <MoreVertical className="h-4 w-4 text-gray-300" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <Modal title="Application Detail" onClose={closeDetail}>
          {detailLoading || !detail ? (
            <p className="py-10 text-center text-gray-400">{detailError || 'Loading...'}</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-black">{detail.studentId.fullName}</div>
                  <div className="text-sm text-gray-500">{detail.studentId.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(detail.status)}`}>
                    {detail.status}
                  </span>
                  <div className="relative">
                    <select
                      value={detail.status}
                      disabled={statusSaving}
                      onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                      className="appearance-none rounded-lg border border-gray-200 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
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
                <DetailField label="Nationality" value={detail.studentId.nationality} />
                <DetailField label="Current Location" value={detail.studentId.currentLocation} />
                <DetailField label="Stage" value={detail.studentId.currentStage} />
                <DetailField label="Curriculum" value={detail.studentId.profile?.education?.curriculum} />
                <DetailField label="Predicted Grades" value={detail.studentId.profile?.education?.predictedGrades} />
                <DetailField label="Intended Course" value={detail.studentId.profile?.education?.intendedCourse} />
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
  sub,
  color,
}: {
  icon: typeof FileText
  value: string
  label: string
  sub: string
  color: 'blue' | 'orange' | 'green' | 'red'
}) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  }[color]
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-black">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{sub}</div>
    </div>
  )
}

function FakeSelect({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600">
      {label} <ChevronDown className="h-4 w-4 text-gray-400" />
    </button>
  )
}
