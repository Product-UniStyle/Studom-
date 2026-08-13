import { useEffect, useState } from 'react'
import { Search, ChevronDown, SlidersHorizontal, MoreVertical } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { institutionNav } from './institutionNav'
import { getInstitutionMe, listInstitutionApplications } from '../../lib/institutionApi'
import type { InstitutionAccount, InstitutionApplicationItem } from '../../lib/institutionApi'
import { statusBadgeClass } from '../student/statusBadge'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function InstitutionApplicationsPage() {
  const [account, setAccount] = useState<InstitutionAccount | null>(null)
  const [applications, setApplications] = useState<InstitutionApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

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
                      <button className="text-sm font-medium text-blue-600">
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
    </DashboardLayout>
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
