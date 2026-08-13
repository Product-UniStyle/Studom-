import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import { studentSignup } from '../../lib/studentApi'
import type { CurrentStage } from '../../lib/studentApi'

const CURRENT_STAGES: CurrentStage[] = [
  'School Student',
  'Undergraduate',
  'Postgraduate',
  'Working Professional',
]

export default function StudentSignup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [currentStage, setCurrentStage] = useState<CurrentStage | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!currentStage) {
      setError('Please select your current stage')
      return
    }
    setSubmitting(true)
    try {
      await studentSignup({ fullName, email, password, birthdate: birthdate || undefined, currentStage })
      navigate('/student/dashboard')
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
          Create Your Studom Account
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
          <TextField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          <TextField
            label="Birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            placeholder="Select your birthdate"
            rightIcon={<Calendar className="h-4 w-4" />}
          />
          <SelectField
            label="Current Stage"
            placeholder="Select your current stage"
            required
            onChange={(e) => setCurrentStage(e.target.value as CurrentStage)}
            options={CURRENT_STAGES}
          />

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
            <Link to="/student/login" className="font-medium text-blue-600">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
