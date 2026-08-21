import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  FileText,
  Download,
  Mail,
  Bell,
  MessageSquare,
  ClipboardCheck,
  Heart,
} from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import SafeImage from '../../components/ui/SafeImage'
import Modal from '../../components/ui/Modal'
import { useApplyFlow } from '../../context/ApplyFlowContext'
import {
  getStudentMe,
  listStudentApplications,
  getStudentApplication,
} from '../../lib/studentApi'
import type {
  StudentProfile,
  StudentStats,
  StudentApplicationItem,
  StudentApplicationEssay,
  StudentApplicationDocument,
} from '../../lib/studentApi'
import { statusBadgeClass } from '../student/statusBadge'

const NEXT_STEPS = [
  {
    icon: Mail,
    title: 'Application Under Review',
    text: 'Your application has been sent to the selected universities. They will review your profile and essays.',
  },
  {
    icon: Bell,
    title: 'Updates & Notifications',
    text: 'You will receive email and in-app notifications about any updates or requests.',
  },
  {
    icon: MessageSquare,
    title: 'University Response',
    text: 'Universities may reach out for additional information or to schedule interviews.',
  },
  {
    icon: ClipboardCheck,
    title: 'Decision',
    text: 'You will be notified once a decision is made. Good luck!',
  },
]

function fmtDate(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function ApplicationSubmittedPage() {
  const { selectedUniversities, essays } = useApplyFlow()

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [applications, setApplications] = useState<StudentApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<StudentApplicationItem | null>(null)
  const [detailEssays, setDetailEssays] = useState<StudentApplicationEssay[]>([])
  const [detailDocuments, setDetailDocuments] = useState<StudentApplicationDocument[]>([])
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
        setDetailEssays(res.essays)
        setDetailDocuments(res.documents)
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
    setDetailEssays([])
    setDetailDocuments([])
    setDetailError(null)
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentApplications()])
      .then(([me, apps]) => {
        if (cancelled) return
        setStudent(me.student)
        setStats(me.stats)
        setApplications(apps.items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedIds = new Set(selectedUniversities.map((u) => u.id))
  const submittedApplications = applications.filter((a) => selectedIds.has(a.universityId._id))
  const latestSubmission = submittedApplications[0]

  if (loading || !student || !stats) {
    return (
      <PageShell hideFooter>
        <p className="mx-auto max-w-5xl px-6 py-20 text-center text-gray-400">Loading...</p>
      </PageShell>
    )
  }

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-5xl px-6 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-9 w-9 text-green-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-black sm:text-3xl">
          Your application has been submitted!
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
          Thank you for applying through Studom. We've received your
          application and sent a confirmation email to{' '}
          <span className="font-medium text-blue-600">{student.email}</span>.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={() => setShowSummaryModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" /> View Application Summary
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-black hover:bg-gray-50">
            <Download className="h-4 w-4" /> Download Application (PDF)
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              What happens next?
            </div>
            <div className="space-y-5">
              {NEXT_STEPS.map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {s.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              Submission Summary
            </div>
            {latestSubmission && (
              <SummaryRow label="Latest Application Ref" value={latestSubmission.applicationRef} link />
            )}
            {latestSubmission && (
              <SummaryRow label="Date of Submission" value={fmtDate(latestSubmission.appliedOn)} />
            )}
            <SummaryRow
              label="Universities Applied"
              value={String(submittedApplications.length)}
            />
            <SummaryRow label="Essay Responses" value={String(essays.length)} />
            <SummaryRow label="Documents Uploaded" value={String(stats.documentsCount)} />
            <SummaryRow label="Profile Completion" value={`${stats.profileCompletion}%`} />
            <div className="mt-4 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
              You can track the status of your application anytime from your{' '}
              <Link to="/student/dashboard" className="underline hover:text-blue-800">
                dashboard
              </Link>
              .
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 font-semibold text-black">
              Universities Applied To
            </div>
            {submittedApplications.length === 0 ? (
              <p className="text-sm text-gray-400">No applications found for this submission.</p>
            ) : (
              <div className="space-y-4">
                {submittedApplications.map((a) => (
                  <div key={a._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={a.universityId.logo}
                        alt=""
                        className="h-9 w-9 rounded-md border border-gray-100 object-contain p-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-black">
                          {a.universityId.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {a.universityId.city}
                          {a.universityId.city && a.universityId.country ? ', ' : ''}
                          {a.universityId.country}
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/universities/${a.universityId.slug || a.universityId._id}`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/student/applications"
              className="mt-4 inline-block text-sm font-medium text-blue-600"
            >
              View all applications →
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50 p-6 text-left sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-black">
                Join the Studom Community
              </div>
              <div className="text-sm text-gray-500">
                Connect with students, share experiences, get advice and
                stay updated on events and opportunities.
              </div>
            </div>
          </div>
          <button className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Explore Community
          </button>
        </div>
      </div>

      {showSummaryModal && (
        <Modal title="My Applications" onClose={() => setShowSummaryModal(false)}>
          <div className="mb-6 grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
            <StatBlock value={String(applications.length)} label="Total Applications" />
            <StatBlock
              value={String(applications.filter((a) => a.status === 'Submitted').length)}
              label="Submitted"
            />
            <StatBlock
              value={String(applications.filter((a) => a.status === 'Under Review').length)}
              label="Under Review"
            />
            <StatBlock
              value={String(applications.filter((a) => a.status === 'Offer Received').length)}
              label="Offer Received"
            />
          </div>

          {applications.length === 0 ? (
            <p className="py-10 text-center text-gray-400">
              You haven't applied to any universities yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200">
              {applications.map((a) => (
                <div
                  key={a._id}
                  className="flex flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
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
                        {new Date(a.appliedOn).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
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
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/student/applications"
            className="mt-4 inline-block text-sm font-medium text-blue-600"
          >
            Go to My Applications page →
          </Link>
        </Modal>
      )}

      {selectedId && (
        <Modal title="Application Detail" onClose={closeDetail}>
          {detailLoading || !detail ? (
            <p className="py-10 text-center text-gray-400">{detailError || 'Loading...'}</p>
          ) : (
            <div className="space-y-5 text-left">
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
                  Essay Responses {detailEssays.length > 0 && `(${detailEssays.length})`}
                </div>
                {detailEssays.length === 0 ? (
                  <p className="text-sm text-gray-400">No essay questions were answered for this application.</p>
                ) : (
                  <div className="space-y-4 rounded-xl border border-gray-100 p-4">
                    {detailEssays.map((e) => (
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
                  Documents {detailDocuments.length > 0 && `(${detailDocuments.length})`}
                </div>
                {detailDocuments.length === 0 ? (
                  <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detailDocuments.map((d) => (
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
    </PageShell>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="text-xl font-bold text-black">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
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

function SummaryRow({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={link ? 'font-medium text-blue-600' : 'text-black'}>
        {value}
      </span>
    </div>
  )
}
