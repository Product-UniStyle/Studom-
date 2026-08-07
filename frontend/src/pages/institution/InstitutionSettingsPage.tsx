import { User, ShieldCheck, Bell, Languages, FileLock2, Users, LogOut, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { institutionNav } from './institutionNav'

const SECTIONS = [
  { icon: User, title: 'Account Details', sub: 'Update your university name, administrator details, email, phone number and other account information.' },
  { icon: ShieldCheck, title: 'Login & Security', sub: 'Change your password and manage security settings to keep your account safe.' },
  { icon: Bell, title: 'Notification Preferences', sub: 'Choose what notifications you want to receive and how you want to receive them.' },
  { icon: Languages, title: 'Language', sub: 'Select your preferred language for the institution dashboard.' },
  { icon: FileLock2, title: 'Data & Privacy', sub: 'Manage your data, download information and review your privacy settings.' },
  { icon: Users, title: 'Team & Access', sub: 'Manage team members, roles and access permissions for your university account.' },
]

export default function InstitutionSettingsPage() {
  return (
    <DashboardLayout
      navItems={institutionNav}
      userName="University of Birmingham Dubai"
      userRole="Institution"
    >
      <h1 className="text-2xl font-bold text-black">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account, preferences and security settings.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <button
            key={s.title}
            className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 p-6 text-left hover:bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-black">{s.title}</div>
                <div className="mt-1 text-sm text-gray-500">{s.sub}</div>
              </div>
            </div>
            <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-gray-300" />
          </button>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-red-200 p-6 text-left hover:bg-red-50">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-red-500">Log Out</div>
            <div className="mt-1 text-sm text-gray-500">
              Sign out of your institution account.
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
      </button>
    </DashboardLayout>
  )
}
