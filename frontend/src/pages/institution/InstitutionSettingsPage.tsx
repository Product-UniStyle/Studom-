import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, ShieldCheck, Bell, Languages, FileLock2, Users, LogOut, ChevronRight } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Modal from '../../components/ui/Modal'
import { institutionNav } from './institutionNav'
import { getInstitutionMe, clearInstitutionToken } from '../../lib/institutionApi'
import type { InstitutionAccount } from '../../lib/institutionApi'
import EditAccountDetailsForm from './EditAccountDetailsForm'
import ChangePasswordForm from './ChangePasswordForm'

const SECTIONS = [
  { key: 'account', icon: User, title: 'Account Details', sub: 'Update your university name, administrator details, email, phone number and other account information.' },
  { key: 'security', icon: ShieldCheck, title: 'Login & Security', sub: 'Change your password and manage security settings to keep your account safe.' },
  { key: 'notifications', icon: Bell, title: 'Notification Preferences', sub: 'Choose what notifications you want to receive and how you want to receive them.' },
  { key: 'language', icon: Languages, title: 'Language', sub: 'Select your preferred language for the institution dashboard.' },
  { key: 'privacy', icon: FileLock2, title: 'Data & Privacy', sub: 'Manage your data, download information and review your privacy settings.' },
  { key: 'team', icon: Users, title: 'Team & Access', sub: 'Manage team members, roles and access permissions for your university account.' },
]

export default function InstitutionSettingsPage() {
  const navigate = useNavigate()
  const [account, setAccount] = useState<InstitutionAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState<'account' | 'security' | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getInstitutionMe()
      .then((me) => {
        if (!cancelled) setAccount(me.account)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load settings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleLogout() {
    clearInstitutionToken()
    navigate('/institution/login', { replace: true })
  }

  if (loading || !account) {
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
      <h1 className="text-2xl font-bold text-black">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account, preferences and security settings.
      </p>

      {successMessage && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => {
              if (s.key === 'account' || s.key === 'security') {
                setSuccessMessage(null)
                setOpenModal(s.key)
              }
            }}
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

      <button
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-red-200 p-6 text-left hover:bg-red-50"
      >
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

      {openModal === 'account' && (
        <Modal title="Account Details" onClose={() => setOpenModal(null)}>
          <EditAccountDetailsForm
            account={account}
            onCancel={() => setOpenModal(null)}
            onSaved={(updated) => {
              setAccount(updated)
              setOpenModal(null)
              setSuccessMessage('Account details updated.')
            }}
          />
        </Modal>
      )}

      {openModal === 'security' && (
        <Modal title="Login & Security" onClose={() => setOpenModal(null)}>
          <ChangePasswordForm
            onCancel={() => setOpenModal(null)}
            onSaved={() => {
              setOpenModal(null)
              setSuccessMessage('Password updated successfully.')
            }}
          />
        </Modal>
      )}
    </DashboardLayout>
  )
}
