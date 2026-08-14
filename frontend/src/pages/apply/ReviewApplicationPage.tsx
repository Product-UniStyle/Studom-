import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../../components/layout/PageShell'
import { useApplyFlow } from '../../context/ApplyFlowContext'
import { getStudentMe, listStudentDocuments, createStudentApplications } from '../../lib/studentApi'
import type { StudentProfile, StudentStats, StudentDocumentItem } from '../../lib/studentApi'

function fmt(value?: string): string {
  return value && value.trim() ? value : 'Not set'
}

export default function ReviewApplicationPage() {
  const { selectedUniversities, essays } = useApplyFlow()
  const navigate = useNavigate()

  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [documents, setDocuments] = useState<StudentDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentMe(), listStudentDocuments()])
      .then(([me, docs]) => {
        if (cancelled) return
        setStudent(me.student)
        setStats(me.stats)
        setDocuments(docs.items)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const essayAnswers = essays
        .filter((q) => q.answer.trim().length > 0)
        .map((q) => ({ universityId: q.universityId, question: q.question, answer: q.answer }))
      await createStudentApplications(selectedUniversities.map((u) => u.id), undefined, essayAnswers)
      navigate('/apply/submitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit applications')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !student || !stats) {
    return (
      <PageShell hideFooter>
        <p className="mx-auto max-w-4xl px-6 py-20 text-center text-gray-400">{error || 'Loading...'}</p>
      </PageShell>
    )
  }

  const personal = student.profile?.personal
  const education = student.profile?.education
  const activities = student.profile?.activities ?? []
  const achievements = student.profile?.achievements ?? []

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
          {selectedUniversities.length === 0 ? (
            <p className="text-sm text-gray-400">No universities selected yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {selectedUniversities.map((u) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-gray-100 px-4 py-4 text-center text-sm font-medium text-black"
                >
                  {u.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="font-semibold text-black">Student Profile</div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                stats.profileCompletion >= 80
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {stats.profileCompletion}% Complete
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
            text={`${student.fullName}, ${student.email}, ${fmt(personal?.mobile)}, ${fmt(student.nationality)}, ${fmt(student.currentLocation)}.`}
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Education Information"
            text={`${fmt(personal?.schoolName)}, ${fmt(education?.curriculum)}, ${fmt(personal?.currentGrade)}, Expected Graduation Year ${fmt(education?.gradYear)}, Subjects: ${education?.subjects?.length ? education.subjects.join(', ') : 'Not set'}, Latest Grades: ${fmt(education?.latestGrades)}.`}
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Activities & Achievements"
            text={
              activities.length === 0 && achievements.length === 0
                ? 'No activities or achievements added yet.'
                : `${activities.length} Activit${activities.length === 1 ? 'y' : 'ies'}, ${achievements.length} Achievement${achievements.length === 1 ? '' : 's'} — ${[...activities.map((a) => a.name), ...achievements.map((a) => a.title)].join(' • ')}`
            }
            onEdit={() => navigate('/profile/build')}
          />
          <ReviewRow
            title="Documents"
            text={
              documents.length === 0
                ? 'No documents uploaded yet.'
                : documents.map((d) => `${d.name}: ${d.status || 'Uploaded'}`).join(', ')
            }
            onEdit={() => navigate('/student/documents')}
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
                      ({q.universityName})
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
            <span>{selectedUniversities.length} universities selected</span>
            <span className="text-gray-300">|</span>
            <span>{essays.length} additional essay responses completed</span>
            <span className="text-gray-300">|</span>
            <span>Profile {stats.profileCompletion}% complete</span>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Only the essay responses required by each university will be
            shared with that university.
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/apply/essays')}
            className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedUniversities.length === 0}
            className="rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Applications'}
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
