import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { useApplyFlow } from '../../context/ApplyFlowContext'

export default function EssayQuestionsPage() {
  const { essays, essaysLoading, updateEssay, profileCompleted } = useApplyFlow()
  const navigate = useNavigate()

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-script text-3xl text-blue-600">
              Additional Essay Questions
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Answer the questions below. Each response will only be shared
              with the universities listed next to the question.
            </p>
          </div>
          <span className="whitespace-nowrap rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
            {essays.length} questions
          </span>
        </div>

        <div className="mt-8 space-y-8 rounded-2xl border border-gray-200 p-8">
          {essaysLoading ? (
            <p className="text-sm text-gray-400">Loading essay questions...</p>
          ) : essays.length === 0 ? (
            <p className="text-sm text-gray-400">
              None of your selected universities require additional essay questions.
            </p>
          ) : (
            essays.map((q) => (
              <div key={q.id}>
                <label className="text-sm font-semibold text-black">
                  {q.question}{' '}
                  <span className="font-normal text-blue-500">
                    ({q.universityName})
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={q.answer}
                  onChange={(e) => updateEssay(q.id, e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-3 font-semibold text-black">Student Profile</div>
          {profileCompleted ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-black">
                    Profile completed
                  </div>
                  <div className="text-sm text-gray-500">
                    Your student profile is ready to be shared with selected
                    universities.
                  </div>
                </div>
              </div>
              <Link
                to="/profile/build"
                className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                Edit Profile
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 shrink-0 text-red-500" />
                <div className="text-sm text-gray-600">
                  Please complete your student profile before submitting your
                  applications.
                </div>
              </div>
              <Link
                to="/profile/build"
                className="shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
              >
                Build Your Profile
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/apply/select')}
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/apply/review')}
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Review Application
          </button>
        </div>
      </div>
    </PageShell>
  )
}
