import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'

export default function StudentLogin() {
  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-script text-center text-4xl text-blue-600">
          Login to Your Studom Account
        </h1>

        <form className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email address"
            icon={<Mail className="h-4 w-4" />}
          />
          <div>
            <TextField
              label="Password"
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
            to="/student/dashboard"
            className="block w-full rounded-lg bg-black py-3.5 text-center text-sm font-semibold text-white underline hover:bg-gray-800"
          >
            Login
          </Link>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/student/signup" className="font-medium text-blue-600">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
