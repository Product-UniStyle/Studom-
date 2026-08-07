import { useState } from 'react'
import { Search, Upload, FileText, Clock, Mail } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { studentNav } from './studentNav'
import { studentDocuments } from '../../data/studentApplications'
import { statusBadgeClass } from './statusBadge'

export default function DocumentsPage() {
  const [query, setQuery] = useState('')
  const filtered = studentDocuments.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <DashboardLayout navItems={studentNav} userName="Kabir Shaikh" userRole="Student">
      <h1 className="text-2xl font-bold text-black">Documents</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage and upload your application documents.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} value="7" label="Uploaded" color="blue" />
        <StatCard icon={Clock} value="2" label="Pending" color="orange" />
        <StatCard icon={Mail} value="1" label="Requested" color="purple" />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-black">My Documents</h2>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-full border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Upload className="h-4 w-4" /> Upload Document
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
              <th className="px-5 py-3 font-medium">Document</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((d) => (
              <tr key={d.name}>
                <td className="flex items-center gap-2 px-5 py-4 font-medium text-black">
                  <FileText className="h-4 w-4 text-gray-400" /> {d.name}
                </td>
                <td className="px-5 py-4 text-gray-500">{d.category}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                      d.status
                    )}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{d.date}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {d.status === 'Uploaded' ? (
                      <>
                        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50">
                          View
                        </button>
                        <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-black hover:bg-gray-50">
                          Replace
                        </button>
                      </>
                    ) : (
                      <button className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        Upload
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Required documents must be uploaded before universities can fully
        review your applications.
      </div>

      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row">
        <div>
          <div className="font-semibold text-black">Need Help?</div>
          <div className="text-sm text-gray-500">
            Our support team is here to assist you.
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
  color,
}: {
  icon: typeof FileText
  value: string
  label: string
  color: 'blue' | 'orange' | 'purple'
}) {
  const colorClass = {
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color]
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-6">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-black">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}
