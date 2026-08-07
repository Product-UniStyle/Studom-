import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'

export default function InstitutionLogin() {
  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-script text-center text-4xl text-blue-600">
          Login to Your Institution Account
        </h1>

        <form className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField
            label="Official University Email"
            required
            type="email"
            placeholder="Enter your official university email"
            icon={<Mail className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Password"
              required
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
            />
            <div className="mt-2 text-right">
              <Link to="#" className="text-sm text-blue-600">
                Forgot Password?
              </Link>
            </div>
          </div>

          <Link
            to="/institution/dashboard"
            className="block w-full rounded-lg bg-black py-3.5 text-center text-sm font-semibold text-white hover:bg-gray-800"
          >
            Login
          </Link>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            OR
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/institution/signup"
              className="font-medium text-blue-600 underline"
            >
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
