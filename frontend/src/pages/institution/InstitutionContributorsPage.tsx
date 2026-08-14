import { useEffect, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Modal from '../../components/ui/Modal'
import { institutionNav } from './institutionNav'
import { getInstitutionMe, listInstitutionContributors, updateContributorStatus } from '../../lib/institutionApi'
import type { InstitutionAccount, InstitutionContributorItem } from '../../lib/institutionApi'
import { statusBadgeClass } from '../student/statusBadge'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function InstitutionContributorsPage() {
  const [account, setAccount] = useState<InstitutionAccount | null>(null)
  const [contributors, setContributors] = useState<InstitutionContributorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<InstitutionContributorItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getInstitutionMe(), listInstitutionContributors()])
      .then(([me, contribs]) => {
        if (cancelled) return
        setAccount(me.account)
        setContributors(contribs.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load contributors')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = contributors.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
  async function handleAction(id: string, status: 'Approved' | 'Rejected') {
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await updateContributorStatus(id, status)
      setContributors((prev) => prev.map((c) => (c._id === id ? res.item : c)))
      setSelected(res.item)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const pendingCount = contributors.filter((c) => c.status === 'Pending Review').length
  const approvedCount = contributors.filter((c) => c.status === 'Approved').length
  const rejectedCount = contributors.filter((c) => c.status === 'Rejected').length

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
      <h1 className="text-2xl font-bold text-black">Contributors</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and manage contributor requests for your university page.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FileText} value={String(contributors.length)} label="Total Requests" color="blue" />
        <StatCard icon={Clock} value={String(pendingCount)} label="Pending Review" color="orange" />
        <StatCard icon={CheckCircle2} value={String(approvedCount)} label="Approved" color="green" />
        <StatCard icon={XCircle} value={String(rejectedCount)} label="Rejected" color="red" />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-black">Contributor Requests</h2>
          <div className="flex gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600">
              All Status <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-gray-400">
            {contributors.length === 0 ? 'No contributor requests yet.' : 'No contributors match your search.'}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Contributor Type</th>
                <th className="py-3 font-medium">Submitted On</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td className="py-4 font-medium text-black">{c.name}</td>
                  <td className="py-4 text-gray-500">{c.type || '-'}</td>
                  <td className="py-4 text-gray-500">
                    {new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => {
                        setActionError(null)
                        setSelected(c)
                      }}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50"
                    >
                      View Request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title="Contributor Request" onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-black">{selected.name}</div>
                {selected.email && <div className="text-sm text-gray-500">{selected.email}</div>}
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(selected.status)}`}>
                {selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <DetailField label="Course / Programme" value={selected.courseOfStudy} />
              <DetailField label="Year of Study" value={selected.yearOfStudy} />
              <DetailField label="Expected Graduation" value={selected.expectedGraduationYear} />
              <DetailField
                label="Submitted On"
                value={new Date(selected.date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </div>

            {selected.reason && (
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Why they want to contribute
                </div>
                <p className="text-sm text-gray-700">{selected.reason}</p>
              </div>
            )}

            {selected.proofUrl && (
              <a
                href={selected.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View uploaded proof →
              </a>
            )}

            {actionError && <p className="text-sm text-red-600">{actionError}</p>}

            {selected.status === 'Pending Review' && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleAction(selected._id, 'Rejected')}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selected._id, 'Approved')}
                  disabled={actionLoading}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
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
  icon: typeof FileText
  value: string
  label: string
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
    </div>
  )
}
