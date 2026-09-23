import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import PageLoading from '../../components/ui/PageLoading'
import { studentNav } from './studentNav'
import { getStudentMe } from '../../lib/studentApi'
import ChangePasswordForm from './ChangePasswordForm'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
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

      <div className="mt-8 max-w-lg rounded-2xl border border-gray-200 p-6">
        <ChangePasswordForm
          onCancel={() => navigate('/student/settings')}
          onSaved={() => setSuccessMessage('Password updated successfully.')}
        />
      </div>
    </DashboardLayout>
  )
}
