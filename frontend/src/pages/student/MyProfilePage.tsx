import { useEffect, useState } from 'react'
import { UserCircle2, FileText, ClipboardCheck, Pencil, Check } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { studentNav } from './studentNav'
import { getStudentMe, listStudentDocuments } from '../../lib/studentApi'
import type { StudentProfile, StudentStats, StudentDocumentItem } from '../../lib/studentApi'

function fmt(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return 'Not set'
  return String(value)
}

function fmtDate(value?: string): string {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MyProfilePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [documents, setDocuments] = useState<StudentDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentDocuments()])
      .then(([me, docs]) => {
        if (cancelled) return
        setStudent(me.student)
        setStats(me.stats)
        setDocuments(docs.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load profile')
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

  const personal = student.profile?.personal
  const education = student.profile?.education
  const activities = student.profile?.activities ?? []
  const achievements = student.profile?.achievements ?? []
  const preferences = student.preferences

  return (
    <DashboardLayout navItems={studentNav} userName={student.fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your personal details, academics and documents.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={UserCircle2} value={`${stats.profileCompletion}%`} label="Profile Completion" />
        <StatCard icon={FileText} value={String(stats.documentsCount)} label="Documents Uploaded" />
        <StatCard icon={ClipboardCheck} value={String(stats.applicationsCount)} label="Applications Submitted" />
      </div>

      <Section title="Personal Information">
        <InfoGrid
          rows={[
            ['Full Name:', student.fullName],
            ['Date of Birth:', fmtDate(student.birthdate)],
            ['Email:', student.email],
            ['Nationality:', fmt(student.nationality)],
            ['Mobile Number:', fmt(personal?.mobile)],
            ['Current Location:', fmt(student.currentLocation)],
          ]}
        />
      </Section>

      <Section title="Education Information">
        <InfoGrid
          rows={[
            ['School Name:', fmt(personal?.schoolName)],
            ['Expected Graduation Year:', fmt(education?.gradYear)],
            ['Curriculum / Board:', fmt(education?.curriculum)],
            ['Subjects:', education?.subjects?.length ? education.subjects.join(', ') : 'Not set'],
            ['Current Grade / Year:', fmt(personal?.currentGrade)],
            ['Intended Field of Study:', fmt(education?.intendedCourse)],
          ]}
        />
      </Section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-black">Activities &amp; Achievements</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          {activities.length === 0 && achievements.length === 0 ? (
            <p className="text-sm text-gray-400">No activities or achievements added yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              {activities.map((a) => (
                <li key={a.name} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" /> {a.name}
                </li>
              ))}
              {achievements.map((a) => (
                <li key={a.title} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-blue-600" /> {a.title}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-xs text-gray-400">
            {activities.length} Activit{activities.length === 1 ? 'y' : 'ies'}, {achievements.length} Achievement
            {achievements.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-black">Documents</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {documents.map((d) => (
                <li key={d._id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4 text-gray-400" /> {d.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="h-3.5 w-3.5" /> {d.status || 'Uploaded'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-black">Account &amp; Preferences</h2>
          <button className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-black hover:bg-gray-50">
            Edit Preferences
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
          <div>
            <div className="text-gray-400">Preferred Intake:</div>
            <div className="mt-1 font-medium text-black">{fmt(preferences?.preferredIntake)}</div>
          </div>
          <div>
            <div className="text-gray-400">Preferred Country:</div>
            <div className="mt-1 font-medium text-black">{fmt(preferences?.preferredCountry)}</div>
          </div>
          <div>
            <div className="text-gray-400">Preferred City:</div>
            <div className="mt-1 font-medium text-black">{fmt(preferences?.preferredCity)}</div>
          </div>
          <div>
            <div className="text-gray-400">Notifications:</div>
            <div className="mt-1 font-medium text-black">{fmt(preferences?.notificationPreference)}</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof UserCircle2
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

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-black">{title}</h2>
        <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      {children}
    </div>
  )
}

function InfoGrid({ rows }: { rows: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="text-gray-400">{label}</span>
          <span className="font-medium text-black">{value}</span>
        </div>
      ))}
    </div>
  )
}
