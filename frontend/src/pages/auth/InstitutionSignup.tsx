import { Link } from 'react-router-dom'
import { UserRound, Mail, Landmark, Briefcase, Lock } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'

export default function InstitutionSignup() {
  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-script text-center text-4xl text-blue-600">
          Create Your Institution Account
        </h1>

        <form className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField
            label="Full Name"
            required
            placeholder="Enter your full name"
            icon={<UserRound className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Official University Email"
              required
              type="email"
              placeholder="Enter your official university email"
              icon={<Mail className="h-4 w-4" />}
            />
            <p className="mt-1 text-xs text-gray-400">
              Please use your official university email address (e.g.,
              name@university.edu)
            </p>
          </div>
          <TextField
            label="University Name"
            required
            placeholder="Enter your university name"
            icon={<Landmark className="h-4 w-4" />}
          />
          <TextField
            label="Designation / Role"
            required
            placeholder="Enter your designation or role"
            icon={<Briefcase className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Password"
              required
              type="password"
              placeholder="Create a strong password"
              icon={<Lock className="h-4 w-4" />}
            />
            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters long
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create Account
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
