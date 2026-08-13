import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Landmark, ClipboardCheck, UserCircle2, Headphones } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SafeImage from '../../components/ui/SafeImage'
import { studentNav } from './studentNav'
import {
  getStudentMe,
  listStudentApplications,
  listStudentTasks,
} from '../../lib/studentApi'
import type { StudentProfile, StudentStats, StudentApplicationItem, StudentTaskItem } from '../../lib/studentApi'
import { statusBadgeClass } from './statusBadge'

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [applications, setApplications] = useState<StudentApplicationItem[]>([])
  const [tasks, setTasks] = useState<StudentTaskItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentApplications(), listStudentTasks()])
      .then(([me, apps, taskList]) => {
        if (cancelled) return
        setStudent(me.student)
        setStats(me.stats)
        setApplications(apps.items)
        setTasks(taskList.items)
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

  if (loading || !student || !stats) {
    return (
      <DashboardLayout navItems={studentNav} userName={student?.fullName || ''} userRole="Student">
        <p className="mt-10 text-center text-gray-400">{error || 'Loading...'}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">Welcome back, {student.fullName.split(' ')[0]}! 👋</h1>
      <p className="mt-1 text-sm text-gray-500">
        Here's a simple overview of your applications.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Landmark} value={String(stats.applicationsCount)} label="Universities Applied" />
        <StatCard icon={ClipboardCheck} value={String(tasks.length)} label="Tasks Pending" />
        <StatCard icon={UserCircle2} value={`${stats.profileCompletion}%`} label="Profile Completion" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold text-black">My Applications</h2>
          {applications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              You haven't applied to any universities yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((a) => (
                <div
                  key={a._id}
                  className="flex items-center justify-between gap-3 py-3"
                >
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
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                  <Link
                    to={`/universities/${a.universityId._id}`}
                    className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold text-black">Upcoming Tasks</h2>
          {tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No upcoming tasks.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <div key={t._id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-black">
                      {t.title}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {t.university}
                    </div>
                    {t.due && (
                      <div className="text-xs text-red-500">
                        Due: {new Date(t.due).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-black hover:bg-gray-50">
                      View
                    </button>
                    <Link
                      to="/student/documents"
                      className="rounded-lg border border-blue-500 px-3 py-1 text-center text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Upload Documents
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-black">Need Help?</div>
            <div className="text-sm text-gray-500">
              Our support team is here to assist you.
            </div>
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
}: {
  icon: typeof Landmark
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-black">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}
