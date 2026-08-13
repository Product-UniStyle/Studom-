import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserRound, Mail, Briefcase, Lock } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'
import PublicUniversityPicker from '../../components/form/PublicUniversityPicker'
import { institutionSignup } from '../../lib/institutionApi'

export default function InstitutionSignup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [university, setUniversity] = useState<{ id: string; name: string } | null>(null)
  const [designation, setDesignation] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!university) {
      setError('Please select your university from the search results')
      return
    }
    setSubmitting(true)
    try {
      await institutionSignup({
        fullName,
        email,
        universityId: university.id,
        universityName: university.name,
        designation: designation || undefined,
        password,
      })
      navigate('/institution/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-script text-center text-4xl text-blue-600">
          Create Your Institution Account
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            icon={<UserRound className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Official University Email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your official university email"
              icon={<Mail className="h-4 w-4" />}
            />
            <p className="mt-1 text-xs text-gray-400">
              Please use your official university email address (e.g.,
              name@university.edu)
            </p>
          </div>
          <PublicUniversityPicker required value={university} onChange={setUniversity} />
          <TextField
            label="Designation / Role"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Enter your designation or role"
            icon={<Briefcase className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              icon={<Lock className="h-4 w-4" />}
            />
            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters long
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/institution/login"
              className="font-medium text-blue-600 underline"
            >
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
