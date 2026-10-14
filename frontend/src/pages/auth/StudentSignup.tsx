import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'
import { studentSignup } from '../../lib/studentApi'
import type { CurrentStage } from '../../lib/studentApi'
import { DIAL_CODE_OPTIONS } from '../../data/countryCodes'
import { COUNTRIES } from '../../data/countries'

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
  const [mobileCountryCode, setMobileCountryCode] = useState('')
  const [mobile, setMobile] = useState('')
  const [countryOfResidence, setCountryOfResidence] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!currentStage) {
      setError('Please select your current stage')
      return
    }
    if (!mobileCountryCode || !mobile.trim()) {
      setError('Please enter your mobile number')
      return
    }
    if (!countryOfResidence) {
      setError('Please select your country of residence')
      return
    }
    setSubmitting(true)
    try {
      await studentSignup({
        fullName,
        email,
        password,
        birthdate: birthdate || undefined,
        currentStage,
        mobile: `${mobileCountryCode} ${mobile.trim()}`,
        countryOfResidence,
      })
      navigate('/student/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16 md:px-10">
        <h1 className="font-script whitespace-nowrap text-center text-lg text-brand-blue sm:text-xl md:text-2xl">
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <SelectField
                className="w-24 shrink-0"
                placeholder="Code"
                options={DIAL_CODE_OPTIONS}
                defaultValue={mobileCountryCode}
                onChange={(e) => setMobileCountryCode(e.target.value)}
              />
              <TextField
                className="flex-1"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter your mobile number"
              />
            </div>
          </div>
          <SelectField
            label="Country of Residence"
            placeholder="Select country"
            required
            defaultValue={countryOfResidence}
            onChange={(e) => setCountryOfResidence(e.target.value)}
            options={COUNTRIES}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-blue py-3.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/student/login" className="font-medium text-brand-blue">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
