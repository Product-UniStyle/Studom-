import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import TextField from '../../components/form/TextField'
import { adminLogin, getAdminToken } from '../../lib/adminApi'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAdminToken()) navigate('/admin', { replace: true })
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await adminLogin(password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl font-semibold text-black">Admin Login</h1>

        <TextField
          label="Password"
          type="password"
          placeholder="Enter admin password"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
