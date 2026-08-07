import { Link } from 'react-router-dom'
import { Landmark, ClipboardCheck, UserCircle2, Headphones } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SafeImage from '../../components/ui/SafeImage'
import { studentNav } from './studentNav'
import {
  studentApplicationsWithUni,
  upcomingTasks,
} from '../../data/studentApplications'
import { statusBadgeClass } from './statusBadge'

export default function StudentDashboardPage() {
  return (
    <DashboardLayout navItems={studentNav} userName="Kabir Shaikh" userRole="Student">
      <h1 className="text-2xl font-bold text-black">Welcome back, Kabir! 👋</h1>
      <p className="mt-1 text-sm text-gray-500">
        Here's a simple overview of your applications.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Landmark} value="4" label="Universities Applied" />
        <StatCard icon={ClipboardCheck} value="2" label="Tasks Pending" />
        <StatCard icon={UserCircle2} value="100%" label="Profile Completion" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold text-black">My Applications</h2>
          <div className="divide-y divide-gray-100">
            {studentApplicationsWithUni.map((a) => (
              <div
                key={a.universityId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <SafeImage
                    src={a.university.logo}
                    alt=""
                    className="h-9 w-9 rounded-md border border-gray-100 object-contain p-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-black">
                      {a.university.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {a.university.city}, UAE
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
                  to={`/universities/${a.universityId}`}
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <h2 className="mb-4 font-semibold text-black">Upcoming Tasks</h2>
          <div className="divide-y divide-gray-100">
            {upcomingTasks.map((t) => (
              <div key={t.title} className="flex items-center gap-3 py-3">
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
                  <div className="text-xs text-red-500">Due: {t.due}</div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-black hover:bg-gray-50">
                    View
                  </button>
                  <button className="rounded-lg border border-blue-500 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                    Upload Documents
                  </button>
                </div>
              </div>
            ))}
          </div>
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
