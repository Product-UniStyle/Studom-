import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import TextField from '../../components/form/TextField'
import SelectField from '../../components/form/SelectField'

export default function StudentSignup() {
  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-script text-center text-4xl text-blue-600">
          Create Your Studom Account
        </h1>

        <form className="mt-10 space-y-6 rounded-2xl border border-gray-100 p-8 shadow-sm">
          <TextField label="Full Name" placeholder="Enter your full name" />
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email address"
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Create a password"
          />
          <TextField
            label="Birthdate"
            type="text"
            placeholder="Select your birthdate"
            rightIcon={<Calendar className="h-4 w-4" />}
          />
          <SelectField
            label="Current Stage"
            placeholder="Select your current stage"
            options={[
              'School Student',
              'Undergraduate',
              'Postgraduate',
              'Working Professional',
            ]}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create Account
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
