import {
  ChevronDown,
  User,
  Mail,
  Phone,
  Languages,
  Bell,
  Palette,
  Lock,
  ShieldCheck,
  Globe,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { studentNav } from './studentNav'

const ACCOUNT_ROWS = [
  { icon: User, title: 'Personal Information', sub: 'Update your name, email, phone number and personal details.', value: 'Kabir Shaikh' },
  { icon: Mail, title: 'Email Address', sub: 'Update your email address.', value: 'kabir.shaikh@gmail.com' },
  { icon: Phone, title: 'Phone Number', sub: 'Update your phone number.', value: '+971 50 123 4567' },
]

const PREFERENCE_ROWS = [
  { icon: Languages, title: 'Language', sub: 'Choose your preferred language.', value: 'English' },
  { icon: Bell, title: 'Notifications', sub: 'Manage how you receive notifications.', value: 'Email + In-app' },
  { icon: Palette, title: 'Appearance', sub: 'Choose your preferred theme.', value: 'Light Mode' },
]

const SECURITY_ROWS = [
  { icon: Lock, title: 'Password', sub: 'Change your account password.', value: '••••••••' },
  { icon: ShieldCheck, title: 'Two-Factor Authentication', sub: 'Add an extra layer of security to your account.', value: 'Off' },
]

const SUPPORT_ROWS = [
  { icon: Globe, title: 'Help & Support', sub: 'Get help with your account or applications.', value: '' },
  { icon: FileText, title: 'Terms & Privacy', sub: 'View our terms of service and privacy policy.', value: '' },
]

export default function SettingsPage() {
  return (
    <DashboardLayout navItems={studentNav} userName="Kabir Shaikh" userRole="Student">
      <h1 className="text-2xl font-bold text-black">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account, preferences and security settings.
      </p>

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 p-6">
        <div>
          <div className="font-semibold text-black">Account Type</div>
          <div className="text-sm text-gray-500">
            Current Schools Student Planning to Apply to University
          </div>
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>

      <SettingsSection title="Account Settings" rows={ACCOUNT_ROWS} />
      <SettingsSection title="Preferences" rows={PREFERENCE_ROWS} />
      <SettingsSection title="Security" rows={SECURITY_ROWS} />
      <SettingsSection title="Support & Legal" rows={SUPPORT_ROWS} />

      <button className="mt-6 flex w-full items-center justify-between rounded-2xl border border-red-200 p-6 text-left hover:bg-red-50">
        <span className="flex items-center gap-3 font-medium text-red-500">
          <LogOut className="h-5 w-5" /> Log Out
        </span>
      </button>
      <p className="mt-2 text-sm text-gray-400">Sign out from your account.</p>
    </DashboardLayout>
  )
}

interface Row {
  icon: typeof User
  title: string
  sub: string
  value: string
}

function SettingsSection({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 font-semibold text-black">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.title}
            className="flex items-center justify-between rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <r.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-black">{r.title}</div>
                <div className="mt-0.5 text-sm text-gray-500">{r.sub}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm text-gray-500">
              {r.value}
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
