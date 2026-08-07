import { UserCircle2, FileText, ClipboardCheck, Pencil, Check } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { studentNav } from './studentNav'

export default function MyProfilePage() {
  return (
    <DashboardLayout navItems={studentNav} userName="Kabir Shaikh" userRole="Student">
      <h1 className="text-2xl font-bold text-black">My Profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your personal details, academics and documents.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={UserCircle2} value="100%" label="Profile Completion" />
        <StatCard icon={FileText} value="7" label="Documents Uploaded" />
        <StatCard icon={ClipboardCheck} value="4" label="Applications Submitted" />
      </div>

      <Section title="Personal Information">
        <InfoGrid
          rows={[
            ['Full Name:', 'Kabir Shaikh'],
            ['Date of Birth:', '10 May 2005'],
            ['Email:', 'kabir.shaikh@gmail.com'],
            ['Nationality:', 'Indian'],
            ['Mobile Number:', '+971 50 123 4567'],
            ['Current Location:', 'Dubai, UAE'],
          ]}
        />
      </Section>

      <Section title="Education Information">
        <InfoGrid
          rows={[
            ['School Name:', 'Delhi Private School Dubai'],
            ['Expected Graduation Year:', '2026'],
            ['Curriculum / Board:', 'CBSE'],
            ['Subjects:', 'Business Studies, Economics, Mathematics, English'],
            ['Current Grade / Year:', 'Grade 12'],
            ['Intended Field of Study:', 'Business Management'],
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
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Debate Club President',
              'Volunteer Tutor',
              'Inter-school Business Case Competition Finalist',
            ].map((a) => (
              <li key={a} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-blue-600" /> {a}
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-gray-400">
            1 Activity, 3 Achievements
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-black">Documents</h2>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              'Passport/ID Proof',
              'Academic Transcripts',
              'Standardized Test Scores',
              'Statement of Purpose',
              'Resume/CV',
              'Other Document',
            ].map((d) => (
              <li key={d} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4 text-gray-400" /> {d}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <Check className="h-3.5 w-3.5" /> Uploaded
                </span>
              </li>
            ))}
          </ul>
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
            <div className="mt-1 font-medium text-black">Fall 2026</div>
          </div>
          <div>
            <div className="text-gray-400">Preferred Country:</div>
            <div className="mt-1 font-medium text-black">United Arab Emirates</div>
          </div>
          <div>
            <div className="text-gray-400">Preferred City:</div>
            <div className="mt-1 font-medium text-black">Dubai</div>
          </div>
          <div>
            <div className="text-gray-400">Notifications:</div>
            <div className="mt-1 font-medium text-black">Email + In-app Enabled</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-4">
        <button className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-50">
          Back
        </button>
        <button className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          Save Changes
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
