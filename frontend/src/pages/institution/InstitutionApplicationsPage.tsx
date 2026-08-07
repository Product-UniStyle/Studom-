import { useState } from 'react'
import { Search, ChevronDown, SlidersHorizontal, MoreVertical } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { institutionNav } from './institutionNav'
import { institutionApplicants } from '../../data/institutionData'
import { statusBadgeClass } from '../student/statusBadge'
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function InstitutionApplicationsPage() {
  const [query, setQuery] = useState('')
  const filtered = institutionApplicants.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout
      navItems={institutionNav}
      userName="University of Birmingham Dubai"
      userRole="Institution"
    >
      <h1 className="text-2xl font-bold text-black">Applications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and manage applications received by your university.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={FileText} value="248" label="Total Applications" sub="All time" color="blue" />
        <StatCard icon={Clock} value="68" label="Pending Review" sub="Require your attention" color="orange" />
        <StatCard icon={CheckCircle2} value="112" label="Accepted" sub="Successful admits" color="green" />
        <StatCard icon={XCircle} value="38" label="Rejected" sub="Unsuccessful admits" color="red" />
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
        <button className="text-sm font-medium text-blue-600">Clear</button>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>Showing 1 to {filtered.length} of 248 applications</span>
        <FakeSelect label="Latest First" />
      </div>

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
              <tr key={a.email}>
                <td className="px-5 py-4 font-medium text-black">{a.name}</td>
                <td className="px-5 py-4 text-gray-500">{a.email}</td>
                <td className="px-5 py-4 text-gray-500">{a.course}</td>
                <td className="px-5 py-4 text-gray-500">{a.date}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{a.lastViewed}</td>
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

      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          Show
          <FakeSelect label="10" />
          per page
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                n === 1 ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'
              }`}
            >
              {n}
            </button>
          ))}
          <span>...</span>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600">
            25
          </button>
        </div>
      </div>
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
