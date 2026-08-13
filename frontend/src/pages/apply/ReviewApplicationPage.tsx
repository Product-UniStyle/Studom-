import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/layout/PageShell'
import { useApplyFlow } from '../../context/ApplyFlowContext'

export default function ReviewApplicationPage() {
  const { selectedUniversities, essays } = useApplyFlow()
  const navigate = useNavigate()

  const selectedUnis = selectedUniversities

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-bold text-black">Review Application</h1>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold text-black">
              Selected Universities
            </div>
            <button
              onClick={() => navigate('/apply/select')}
              className="rounded-lg border border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {selectedUnis.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-gray-100 px-4 py-4 text-center text-sm font-medium text-black"
              >
                {u.name}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="font-semibold text-black">Student Profile</div>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Completed
            </span>
            <button
              onClick={() => navigate('/profile/build')}
              className="ml-auto rounded-lg border border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Edit
            </button>
          </div>

          <ReviewRow
            title="Personal Information"
            text="Aarav Sharma, aarav.sharma@email.com, +971 50 123 4567, Indian, Dubai, UAE."
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Education Information"
            text="Delhi Private School Dubai, CBSE, Grade 12, Expected Graduation Year 2026, Subjects: Business Studies, Economics, Mathematics, English, Latest Grades: 89%."
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Activities & Achievements"
            text="1 Activity, 3 Achievements — Debate Club President • Volunteer Tutor • Inter-school Business Case Competition Finalist"
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Documents"
            text="Passport/ID Proof: Uploaded, Academic Transcripts: Uploaded, Standardized Test Scores: Uploaded, Letter of Recommendation: Uploaded, Statement of Purpose: Uploaded, Resume/CV: Uploaded."
            onEdit={() => navigate('/profile/build')}
            last
          />
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 font-semibold text-black">
            Additional Essay Questions
          </div>
          <div className="space-y-5">
            {essays.map((q) => (
              <div key={q.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-black">
                    {q.question}{' '}
                    <span className="font-normal text-blue-500">
                      ({q.universities.join(', ')})
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {q.answer || 'No response provided.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/apply/essays')}
                  className="shrink-0 rounded-lg border border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 font-semibold text-black">
            Submission Summary
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>{selectedUnis.length} universities selected</span>
            <span className="text-gray-300">|</span>
            <span>{essays.length} additional essay responses completed</span>
            <span className="text-gray-300">|</span>
            <span>Profile completed</span>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Only the essay responses required by each university will be
            shared with that university.
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/apply/essays')}
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/apply/submitted')}
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Submit Applications
          </button>
        </div>
      </div>
    </PageShell>
  )
}

function ReviewRow({
  title,
  text,
  onEdit,
  last,
}: {
  title: string
  text: string
  onEdit: () => void
  last?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-4 ${
        !last ? 'border-b border-gray-100' : ''
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-black">{title}</div>
        <p className="mt-1 text-sm text-gray-600">{text}</p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 rounded-lg border border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
      >
        Edit
      </button>
    </div>
  )
}
