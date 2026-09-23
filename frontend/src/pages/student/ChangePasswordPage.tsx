import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PageLoading from '../../components/ui/PageLoading'
import Modal from '../../components/ui/Modal'
import { studentNav } from './studentNav'
import { getStudentMe } from '../../lib/studentApi'
import ChangePasswordForm from './ChangePasswordForm'

export default function ChangePasswordPage() {
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getStudentMe()
      .then((me) => {
        if (!cancelled) setFullName(me.student.fullName)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <DashboardLayout navItems={studentNav} userName="" userRole="Student">
        <PageLoading message="Loading..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={studentNav} userName={fullName} userRole="Student">
      <h1 className="text-2xl font-bold text-black">Change Password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Update the password you use to sign in to your account.
      </p>

      {successMessage && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-black">Password</div>
            <div className="mt-0.5 text-sm text-gray-500">Change your account password.</div>
          </div>
        </div>
        <button
          onClick={() => {
            setSuccessMessage(null)
            setModalOpen(true)
          }}
          className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
        >
          Change Password
        </button>
      </div>

      {modalOpen && (
        <Modal title="Change Password" onClose={() => setModalOpen(false)}>
          <ChangePasswordForm
            onCancel={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false)
              setSuccessMessage('Password updated successfully.')
            }}
          />
        </Modal>
      )}
    </DashboardLayout>
  )
}
