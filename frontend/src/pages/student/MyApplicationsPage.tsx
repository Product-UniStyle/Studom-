import { useState } from 'react'
import { Search, ChevronDown, Download } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import SafeImage from '../../components/ui/SafeImage'
import { studentNav } from './studentNav'
import { Landmark, CheckCircle2, Clock, ClipboardList } from 'lucide-react'
import { studentApplicationsWithUni } from '../../data/studentApplications'
import { statusBadgeClass } from './statusBadge'

export default function MyApplicationsPage() {
  const [query, setQuery] = useState('')

  const filtered = studentApplicationsWithUni.filter((a) =>
    a.university.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout navItems={studentNav} userName="Kabir Shaikh" userRole="Student">
      <h1 className="text-2xl font-bold text-black">My Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Track and manage all your university applications in one place.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Landmark} value="4" label="Total Applications" color="blue" />
        <StatCard icon={CheckCircle2} value="2" label="Submitted" color="green" />
        <StatCard icon={Clock} value="1" label="Under Review" color="blue" />
        <StatCard icon={ClipboardList} value="1" label="Offer Received" color="purple" />
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

      <div className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200">
        {filtered.map((a) => (
          <div
            key={a.universityId}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <SafeImage
                src={a.university.logo}
                alt=""
                className="h-10 w-10 rounded-md border border-gray-100 object-contain p-1"
              />
              <div>
                <div className="font-medium text-black">
                  {a.university.name}
                </div>
                <div className="text-xs text-gray-400">
                  {a.university.city}, UAE
                </div>
                <div className="text-xs text-gray-400">{a.course}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm sm:gap-8">
              <div>
                <div className="text-xs text-gray-400">Applied On</div>
                <div className="font-medium text-black">{a.appliedOn}</div>
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
              <button className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
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

      <div className="mt-8 flex items-center justify-center gap-2">
        {[1, 2].map((n) => (
          <button
            key={n}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
              n === 1
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 text-gray-600'
            }`}
          >
            {n}
          </button>
        ))}
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
