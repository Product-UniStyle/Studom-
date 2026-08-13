import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  Users,
  PenSquare,
  Landmark,
  GraduationCap,
  FileCheck,
  Image,
  Contact,
  Star,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { institutionNav } from './institutionNav'
import {
  getInstitutionMe,
  listInstitutionApplications,
  listInstitutionContributors,
} from '../../lib/institutionApi'
import type {
  InstitutionAccount,
  InstitutionStats,
  InstitutionApplicationItem,
  InstitutionContributorItem,
} from '../../lib/institutionApi'
import { statusBadgeClass } from '../student/statusBadge'

const MANAGE_SECTIONS = [
  { icon: Landmark, title: 'Edit University Information', sub: 'Update basic information about your university.' },
  { icon: GraduationCap, title: 'Manage Courses', sub: 'Add, edit or remove courses and programs.' },
  { icon: FileCheck, title: 'Entry Requirements', sub: 'Update academic and language requirements.' },
  { icon: Image, title: 'Photos & Media', sub: 'Manage photos, videos and campus media.' },
  { icon: Contact, title: 'University Contact / POC', sub: 'Update contact details and key representatives.' },
  { icon: Star, title: 'Reviews / Contributors', sub: 'Manage reviews and contributor content.' },
]

export default function InstitutionDashboardPage() {
  const [account, setAccount] = useState<InstitutionAccount | null>(null)
  const [stats, setStats] = useState<InstitutionStats | null>(null)
  const [applications, setApplications] = useState<InstitutionApplicationItem[]>([])
  const [contributors, setContributors] = useState<InstitutionContributorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getInstitutionMe(), listInstitutionApplications(), listInstitutionContributors()])
      .then(([me, apps, contribs]) => {
        if (cancelled) return
        setAccount(me.account)
        setStats(me.stats)
        setApplications(apps.items)
        setContributors(contribs.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !account || !stats) {
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
      <p className="text-sm text-gray-500">Welcome back,</p>
      <h1 className="text-2xl font-bold text-blue-600">
        {account.universityName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here's what's happening with your university on Studom.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} value={String(stats.totalApplications)} label="Applications Received" linkLabel="View all applications" to="/institution/applications" color="blue" />
        <StatCard icon={Clock} value={String(stats.pendingApplications)} label="Pending Review" linkLabel="Review now" to="/institution/applications" color="orange" />
        <StatCard icon={Users} value={String(stats.pendingContributors)} label="Contributor Requests" linkLabel="View requests" to="/institution/contributors" color="green" />
        <StatCard icon={PenSquare} value="—" label="University Page Views" linkLabel="View analytics" to="/institution/university-page" color="purple" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-black">Recent Applications</h2>
            <Link to="/institution/applications" className="text-sm font-medium text-blue-600">
              View all applications →
            </Link>
          </div>
          {applications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No applications received yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.slice(0, 5).map((a) => (
                <div key={a._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-black">{a.studentId.fullName}</div>
                    <div className="text-xs text-gray-400">{a.course || '-'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(a.status)}`}>
                      {a.status}
                    </span>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-black">Contributor Requests</h2>
            <Link to="/institution/contributors" className="text-sm font-medium text-blue-600">
              View all requests →
            </Link>
          </div>
          {contributors.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No contributor requests yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {contributors.slice(0, 5).map((c) => (
                <div key={c._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-black">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.type || '-'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-black">Manage University Page</h2>
          <Link to="/institution/university-page" className="text-sm font-medium text-blue-600">
            Preview Public Page ↗
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {MANAGE_SECTIONS.map((s) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-sm font-medium text-black">{s.title}</div>
              <div className="mt-1 text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  linkLabel,
  to,
  color,
}: {
  icon: typeof FileText
  value: string
  label: string
  linkLabel: string
  to: string
  color: 'blue' | 'orange' | 'green' | 'purple'
}) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color]
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-black">{value}</div>
      <Link to={to} className="mt-2 inline-block text-sm font-medium text-blue-600">
        {linkLabel} →
      </Link>
    </div>
  )
}
