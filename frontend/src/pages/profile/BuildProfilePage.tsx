import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import ProfileStepper from './ProfileStepper'
import PersonalInfoStep from './steps/PersonalInfoStep'
import EducationInfoStep from './steps/EducationInfoStep'
import ActivitiesStep from './steps/ActivitiesStep'
import DocumentsStep from './steps/DocumentsStep'
import ReviewStep from './steps/ReviewStep'
import { initialProfileData, REQUIRED_DOCUMENTS, type ProfileData } from './profileTypes'
import { getStudentMe, updateStudentMe } from '../../lib/studentApi'
import type { StudentProfile, StudentProfilePatch } from '../../lib/studentApi'

function toProfileData(student: StudentProfile): ProfileData {
  const { personal, education, activities, achievements } = student.profile
  return {
    personal: {
      fullName: student.fullName,
      email: student.email,
      mobile: personal?.mobile || '',
      countryOfResidence: personal?.countryOfResidence || '',
      schoolName: personal?.schoolName || '',
      currentGrade: personal?.currentGrade || '',
      confirmed: personal?.confirmed || false,
    },
    education: {
      curriculum: education?.curriculum || '',
      gradYear: education?.gradYear || '',
      subjects: education?.subjects?.length ? education.subjects.join(', ') : '',
      latestGrades: education?.latestGrades || '',
      predictedGrades: education?.predictedGrades || '',
      englishTest: education?.englishTest || '',
      standardizedTest: education?.standardizedTest || '',
      intendedCourse: education?.intendedCourse || '',
    },
    activities: activities?.length
      ? activities.map((a) => ({
          id: crypto.randomUUID(),
          name: a.name,
          role: a.role || '',
          year: a.year || '',
          description: a.description || '',
        }))
      : initialProfileData.activities,
    achievements: achievements?.length
      ? achievements.map((a) => ({
          id: crypto.randomUUID(),
          title: a.title,
          level: a.level || '',
          year: a.year || '',
          description: a.description || '',
        }))
      : initialProfileData.achievements,
    documents: Object.fromEntries(REQUIRED_DOCUMENTS.map((d) => [d, null])),
  }
}

function validateStep(step: number, data: ProfileData): string | null {
  if (step === 1) {
    const p = data.personal
    if (!p.fullName.trim()) return 'Full Name is required.'
    if (!p.mobile.trim()) return 'Mobile Number is required.'
    if (!p.countryOfResidence.trim()) return 'Country of Residence is required.'
    if (!p.schoolName.trim()) return 'School Name is required.'
    if (!p.currentGrade.trim()) return 'Current Grade / Year is required.'
    if (!p.confirmed) return 'Please confirm that the information provided is accurate.'
  }
  if (step === 2) {
    const e = data.education
    if (!e.curriculum.trim()) return 'Curriculum / Board is required.'
    if (!e.gradYear.trim()) return 'Expected Graduation Year is required.'
    if (!e.subjects.trim()) return 'Subjects Currently Studying is required.'
    if (!e.latestGrades.trim()) return 'Latest Grades / GPA / Percentage is required.'
    if (!e.predictedGrades.trim()) return 'Predicted Final Grades is required.'
    if (!e.intendedCourse.trim()) return 'Intended Course / Field of Study is required.'
  }
  return null
}

function toPatch(data: ProfileData): StudentProfilePatch {
  return {
    fullName: data.personal.fullName || undefined,
    personal: {
      mobile: data.personal.mobile,
      countryOfResidence: data.personal.countryOfResidence,
      schoolName: data.personal.schoolName,
      currentGrade: data.personal.currentGrade,
      confirmed: data.personal.confirmed,
    },
    education: {
      curriculum: data.education.curriculum,
      gradYear: data.education.gradYear,
      subjects: data.education.subjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      latestGrades: data.education.latestGrades,
      predictedGrades: data.education.predictedGrades,
      englishTest: data.education.englishTest,
      standardizedTest: data.education.standardizedTest,
      intendedCourse: data.education.intendedCourse,
    },
    activities: data.activities
      .filter((a) => a.name.trim())
      .map(({ name, role, year, description }) => ({ name, role, year, description })),
    achievements: data.achievements
      .filter((a) => a.title.trim())
      .map(({ title, level, year, description }) => ({ title, level, year, description })),
  }
}

export default function BuildProfilePage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ProfileData>(initialProfileData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getStudentMe()
      .then((me) => {
        if (!cancelled) setData(toProfileData(me.student))
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

  const goToStep = (s: number) => {
    setStep(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => goToStep(Math.min(5, step + 1))
  const back = () => {
    setValidationError(null)
    goToStep(Math.max(1, step - 1))
  }

  function handleContinue() {
    const validationMessage = validateStep(step, data)
    if (validationMessage) {
      setValidationError(validationMessage)
      return
    }
    setValidationError(null)
    next()
  }

  function handleSkip() {
    setValidationError(null)
    next()
  }

  const updatePersonal = (patch: Partial<ProfileData['personal']>) =>
    setData((d) => ({ ...d, personal: { ...d.personal, ...patch } }))
  const updateEducation = (patch: Partial<ProfileData['education']>) =>
    setData((d) => ({ ...d, education: { ...d.education, ...patch } }))
  const updateActivities = (
    patch: Partial<Pick<ProfileData, 'activities' | 'achievements'>>
  ) => setData((d) => ({ ...d, ...patch }))
  const updateDocuments = (patch: Record<string, string | null>) =>
    setData((d) => ({ ...d, documents: { ...d.documents, ...patch } }))

  async function save(): Promise<boolean> {
    setSaving(true)
    setError(null)
    try {
      await updateStudentMe(toPatch(data))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    const ok = await save()
    if (ok) {
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2500)
    }
  }

  async function handleSaveProfile() {
    const ok = await save()
    if (ok) navigate('/apply/select')
  }

  if (loading) {
    return (
      <PageShell hideFooter>
        <p className="mx-auto max-w-4xl px-6 py-20 text-center text-gray-400">Loading your profile...</p>
      </PageShell>
    )
  }

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-black">
            Build Your Student Profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Complete your profile once and use it to apply to multiple
            universities through Studom.
          </p>
        </div>

        <div className="mt-10">
          <ProfileStepper current={step} />
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 p-8">
          {step === 1 && (
            <PersonalInfoStep data={data} update={updatePersonal} />
          )}
          {step === 2 && (
            <EducationInfoStep data={data} update={updateEducation} />
          )}
          {step === 3 && (
            <ActivitiesStep data={data} update={updateActivities} />
          )}
          {step === 4 && (
            <DocumentsStep data={data} update={updateDocuments} />
          )}
          {step === 5 && <ReviewStep data={data} goToStep={goToStep} />}

          {validationError && <p className="mt-6 text-sm text-red-600">{validationError}</p>}
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
          {savedNotice && <p className="mt-6 text-sm text-green-600">Draft saved.</p>}

          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
            <div>
              {step > 1 && (
                <button
                  onClick={back}
                  className="flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {step === 1 && (
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              {(step === 3 || step === 4) && (
                <button
                  onClick={handleSkip}
                  className="text-sm font-medium text-gray-500 underline"
                >
                  Skip for now
                </button>
              )}
              {step < 5 ? (
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  {step === 1 ? 'Continue' : 'Next'}
                  {step > 1 && <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
